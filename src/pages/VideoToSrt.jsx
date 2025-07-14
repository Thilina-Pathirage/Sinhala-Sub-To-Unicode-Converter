// src/pages/VideoToSrt.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Paper,
  Box,
  TextField,
  Grid,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Slider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import TranslateIcon from "@mui/icons-material/Translate";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTheme } from "@mui/material/styles";
import { handleSRTConversion } from "../utils/subtitleUtils";
import {
  saveVideo,
  getVideo,
  saveSrtData,
  getSrtData,
  clearData,
  checkDBHealth,
  fallbackStorage,
} from "../utils/db";

const VideoToSrt = () => {
  const theme = useTheme();
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [srtData, setSrtData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [dbHealthy, setDbHealthy] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const subtitleRefs = useRef({});
  
  // New state for subtitle interactions
  const [activeDrag, setActiveDrag] = useState(null);
  const [activeResize, setActiveResize] = useState(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialTime, setInitialTime] = useState({ start: 0, end: 0 });
  const [duration, setDuration] = useState(0);
  const timelineRef = useRef(null);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Check database health first
        const healthCheck = await checkDBHealth();
        setDbHealthy(healthCheck.healthy);
        
        if (!healthCheck.healthy) {
          console.warn("IndexedDB not available, using fallback storage:", healthCheck.message);
          setUseFallback(true);
          
          // Try to load SRT data from fallback storage
          const savedSrt = await fallbackStorage.getSrtData();
          if (savedSrt) {
            setSrtData(savedSrt.data);
          }
          return;
        }

        // Use normal IndexedDB
        const savedVideo = await getVideo();
        const savedSrt = await getSrtData();

        if (savedVideo) {
          const videoUrl = URL.createObjectURL(savedVideo.blob);
          setVideoUrl(videoUrl);
        }

        if (savedSrt) {
          setSrtData(savedSrt.data);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
        setError(`Failed to load saved data: ${error.message}`);
        
        // Try fallback storage
        setUseFallback(true);
        try {
          const savedSrt = await fallbackStorage.getSrtData();
          if (savedSrt) {
            setSrtData(savedSrt.data);
          }
        } catch (fallbackError) {
          console.error("Fallback storage also failed:", fallbackError);
        }
      }
    };

    loadSavedData();

    // Cleanup video URL on unmount
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  const timeToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":");
    const [secs, ms] = seconds.split(",");
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(secs) +
      parseInt(ms) / 1000
    );
  };

  // Convert seconds to SRT timecode format
  const secondsToTimecode = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Update subtitle timecode only if in editing mode
  const updateSubtitleTime = async (index, newStart, newEnd) => {
    if (!isEditing) return; // Only allow updates in edit mode

    const newData = srtData.map((subtitle, i) => {
      if (i === index) {
        return {
          ...subtitle,
          timecode: `${secondsToTimecode(newStart)} --> ${secondsToTimecode(newEnd)}`
        };
      }
      return subtitle;
    });
    
    setSrtData(newData);

    // Save to storage asynchronously
    try {
      if (useFallback) {
        await fallbackStorage.saveSrtData(newData);
      } else {
        await saveSrtData(newData);
      }
    } catch (error) {
      console.error("Error saving updated subtitle times:", error);
      // Optionally show error to user
      setError("Failed to save subtitle changes");
    }
  };

  // Handle mouse down for dragging only if in editing mode
  const handleDragStart = (e, index, type) => {
    if (!isEditing) return; // Only allow drag/resize in edit mode
    
    e.stopPropagation();
    console.log('Drag start:', { index, type });
    
    const rect = timelineRef.current.getBoundingClientRect();
    const [start, end] = srtData[index].timecode.split(" --> ").map(timeToSeconds);
    
    setInitialMousePos({ x: e.clientX - rect.left });
    setInitialTime({ start, end });
    
    if (type === 'move') {
      setActiveDrag(index);
    } else {
      setActiveResize({ index, edge: type });
    }
    
    document.body.classList.add('dragging');
  };

  // Handle mouse move for dragging and resizing
  const handleTimelineMouseMove = (e) => {
    if (!timelineRef.current || (!activeDrag && !activeResize)) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const pixelsPerSecond = (rect.width / duration);
    const timeDiff = (e.clientX - rect.left - initialMousePos.x) / pixelsPerSecond;
    
    console.log('Mouse move:', { activeDrag, activeResize, timeDiff });

    if (activeDrag !== null) {
      // Moving the entire subtitle block
      const newStart = Math.max(0, initialTime.start + timeDiff);
      const newEnd = Math.min(duration, initialTime.end + timeDiff);
      if (newStart !== initialTime.start || newEnd !== initialTime.end) {
        updateSubtitleTime(activeDrag, newStart, newEnd);
      }
    } else if (activeResize) {
      // Resizing the subtitle block
      const { index, edge } = activeResize;
      if (edge === 'left') {
        const newStart = Math.max(0, Math.min(initialTime.end - 0.5, initialTime.start + timeDiff));
        updateSubtitleTime(index, newStart, initialTime.end);
      } else {
        const newEnd = Math.min(duration, Math.max(initialTime.start + 0.5, initialTime.end + timeDiff));
        updateSubtitleTime(index, initialTime.start, newEnd);
      }
    }
  };

  // Handle mouse up to end drag/resize
  const handleTimelineMouseUp = () => {
    console.log('Mouse up');
    setActiveDrag(null);
    setActiveResize(null);
    document.body.classList.remove('dragging');
  };

  // Add event listeners for drag/resize
  useEffect(() => {
    const handleMouseMove = (e) => handleTimelineMouseMove(e);
    const handleMouseUp = () => handleTimelineMouseUp();

    if (activeDrag !== null || activeResize !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, activeResize, initialMousePos, initialTime, duration]);

  // Add CSS to prevent text selection during drag
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body.dragging {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);

    if (isEditing) {
      const currentSubtitle = srtData.find((subtitle) => {
        const [start, end] = subtitle.timecode
          .split(" --> ")
          .map(timeToSeconds);
        return time >= start && time <= end;
      });

      if (currentSubtitle && subtitleRefs.current[currentSubtitle.index]) {
        subtitleRefs.current[currentSubtitle.index].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const parseSrtContent = (content) => {
    const blocks = content.trim().split("\n\n");
    return blocks.map((block) => {
      const lines = block.split("\n");
      return {
        index: parseInt(lines[0]),
        timecode: lines[1],
        text: lines.slice(2).join(" "),
      };
    });
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Try to save video to IndexedDB (only if database is healthy)
      if (dbHealthy && !useFallback) {
        try {
      await saveVideo(file);
      setVideoUrl(URL.createObjectURL(file));
        } catch (dbError) {
          console.warn("Failed to save video to IndexedDB:", dbError.message);
          setUseFallback(true);
          setDbHealthy(false);
          
          // Show warning but continue with video processing
          setError(`Video won't be saved for next session: ${dbError.message}`);
          setVideoUrl(URL.createObjectURL(file));
        }
      } else {
        // Just create the video URL without saving
        setVideoUrl(URL.createObjectURL(file));
      }

      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch(
        // `https://srtapi.wizqo.club/upload`,
        `http://127.0.0.1:5000/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedSrt = parseSrtContent(data.srtContent);
      setSrtData(parsedSrt);

      // Save SRT data (use fallback if needed)
      try {
        if (useFallback) {
          await fallbackStorage.saveSrtData(parsedSrt);
        } else {
      await saveSrtData(parsedSrt);
        }
      } catch (saveError) {
        console.warn("Failed to save SRT data:", saveError.message);
        // Don't block the process, just warn
        if (error) {
          setError(`${error} Also, subtitle data won't be saved: ${saveError.message}`);
        } else {
          setError(`Subtitle data won't be saved for next session: ${saveError.message}`);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAll = () => {
    setIsEditing(true);
    // Clear any active drag or resize operations
    setActiveDrag(null);
    setActiveResize(null);
  };

  const handleSaveAll = async () => {
    setIsEditing(false);
    // Save all changes
    try {
      if (useFallback) {
        await fallbackStorage.saveSrtData(srtData);
      } else {
        await saveSrtData(srtData);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      setError("Failed to save changes");
    }
  };

  const handleTextUpdate = async (index, value) => {
    const newData = [...srtData];
    newData[index].text = value;
    setSrtData(newData);

    // Save updated SRT data (use fallback if needed)
    try {
      if (useFallback) {
        await fallbackStorage.saveSrtData(newData);
      } else {
      await saveSrtData(newData);
      }
    } catch (error) {
      console.error("Error saving SRT data:", error);
    }
  };

  const handleClearData = async () => {
    try {
      if (useFallback) {
        await fallbackStorage.clearData();
      } else {
      await clearData();
      }
      
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      setVideoUrl(null);
      setSrtData([]);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error("Error clearing data:", error);
      setError(`Failed to clear data: ${error.message}`);
    }
  };

  const generateSrtFile = () => {
    const content = srtData
      .map((item) => `${item.index}\n${item.timecode}\n${item.text}\n`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateConvertedSrtFile = () => {
    const content = srtData
      .map((item) => `${item.index}\n${item.timecode}\n${item.text}\n`)
      .join("\n");

    const convertedContent = handleSRTConversion(content);
    const blob = new Blob([convertedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_subtitles.srt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container
      maxWidth="lg"
      style={{ marginTop: "20px", marginBottom: "80px" }}
    >
      <Paper
        elevation={1}
        style={{
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "120px",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Video to SRT Converter
        </Typography>

        {srtData.length ? null : (
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4, px: 2 }}
          >
            Upload your video and get automatic subtitles with our advanced
            speech recognition. You can edit the generated subtitles before
            downloading the SRT file. Perfect for creating accurate subtitles
            for your videos in Sinhala language.
          </Typography>
        )}

        {!dbHealthy && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.warning.light,
              color: theme.palette.warning.contrastText,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body2">
              ⚠️ Limited storage mode: Videos won't be saved for next session, but subtitle editing will still work.
            </Typography>
          </Box>
        )}

        <Box marginY={4}>
          <input
            accept="video/*"
            style={{ display: "none" }}
            id="video-upload"
            type="file"
            onChange={handleVideoUpload}
          />

          <Box display="flex" justifyContent="center">
            <label htmlFor="video-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                Upload Video
              </Button>
            </label>
          </Box>

          {error && (
            <Typography
              color="error"
              align="center"
              style={{ marginTop: "10px" }}
            >
              {error}
            </Typography>
          )}

          {loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography>Processing video...</Typography>
            </Box>
          )}
        </Box>

        {videoUrl && (
          <>
            <Box
              sx={{
                top: 0,
                zIndex: 1,
                bgcolor: theme.palette.background.paper,
                pt: 2,
                pb: 2,
                height: "35vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <video
                controls
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => {
                  setDuration(e.target.duration);
                }}
                style={{
                  borderRadius: "8px",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  backgroundColor: "#000",
                }}
                src={videoUrl}
              />
            </Box>

            {/* Timeline */}
            <Box
              sx={{
                mt: 2,
                height: 100,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                cursor: isEditing ? 'pointer' : 'default',
                border: isEditing ? `2px solid ${theme.palette.primary.main}` : 'none',
              }}
              ref={timelineRef}
              onClick={(e) => {
                if (!isEditing) return; // Only allow timeline clicks in edit mode
                const rect = timelineRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = (clickX / rect.width) * duration;
                const video = document.querySelector('video');
                if (video) {
                  video.currentTime = Math.max(0, Math.min(newTime, duration));
                  setCurrentTime(newTime);
                }
              }}
            >
              {/* Edit mode indicator */}
              {isEditing && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    zIndex: 10,
                  }}
                >
                  Edit Mode
                </Box>
              )}

              {/* Time markers */}
              {duration > 0 && Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: `${(i / duration) * 100}%`,
                    top: 0,
                    height: '20px',
                    width: 1,
                    bgcolor: theme.palette.divider,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: 4,
                      top: 2,
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {Math.floor(i / 60)}:{(i % 60).toString().padStart(2, '0')}
                  </Typography>
                </Box>
              ))}

              {/* Playhead */}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(currentTime / duration) * 100}%`,
                  top: 0,
                  height: '100%',
                  width: 2,
                  bgcolor: theme.palette.error.main,
                  zIndex: 3,
                }}
              />

              {/* Subtitle blocks */}
              {srtData.map((subtitle, index) => {
                const [start, end] = subtitle.timecode.split(" --> ").map(timeToSeconds);
                const leftPercent = (start / duration) * 100;
                const widthPercent = ((end - start) / duration) * 100;
                const isActive = currentTime >= start && currentTime <= end;
                const isDragging = activeDrag === index;
                const isResizing = activeResize?.index === index;

                return (
                  <Box
                    key={subtitle.index}
                    sx={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: 24,
                      height: 60,
                      bgcolor: isActive ? theme.palette.primary.main : theme.palette.primary.light,
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isEditing ? 'move' : 'default',
                      zIndex: isActive || isDragging || isResizing ? 2 : 1,
                      transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
                      '&:hover': isEditing ? {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      } : {},
                      opacity: isDragging || isResizing ? 0.8 : 1,
                      userSelect: 'none',
                      border: isEditing ? `1px dashed ${theme.palette.primary.main}` : 'none',
                    }}
                    onMouseDown={(e) => handleDragStart(e, index, 'move')}
                  >
                    {/* Resize handles - only show in edit mode */}
                    {isEditing && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 12,
                            height: '100%',
                            cursor: 'w-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.1)',
                            },
                            zIndex: 3,
                          }}
                          onMouseDown={(e) => handleDragStart(e, index, 'left')}
                        >
                          <DragIndicatorIcon sx={{ fontSize: 16, color: 'white', transform: 'rotate(90deg)' }} />
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: 12,
                            height: '100%',
                            cursor: 'e-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.1)',
                            },
                            zIndex: 3,
                          }}
                          onMouseDown={(e) => handleDragStart(e, index, 'right')}
                        >
                          <DragIndicatorIcon sx={{ fontSize: 16, color: 'white', transform: 'rotate(90deg)' }} />
                        </Box>
                      </>
                    )}

                    {/* Subtitle text */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        mt: 0.5,
                      }}
                    >
                      #{subtitle.index}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontSize: '0.7rem',
                        maxWidth: '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        mt: 0.5,
                      }}
                    >
                      {subtitle.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {srtData.length > 0 && (
          <>
            <Box
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Subtitle Editor</Typography>
              <Box display="flex" gap={1}>
                <IconButton
                  color="error"
                  onClick={handleClearData}
                  sx={{
                    border: 1,
                    borderColor: "error.main",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  color={isEditing ? "success" : "primary"}
                  onClick={isEditing ? handleSaveAll : handleEditAll}
                  sx={{
                    border: 1,
                    borderColor: isEditing ? "success.main" : "primary.main",
                  }}
                >
                  {isEditing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden",
                mt: 2,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: theme.palette.background.paper,
                },
                "&::-webkit-scrollbar-thumb": {
                  background: theme.palette.primary.main,
                  borderRadius: "4px",
                },
                padding: "10px",
              }}
            >
              <Grid container spacing={2}>
                {srtData.map((subtitle, index) => {
                  const [startTime, endTime] = subtitle.timecode
                    .split(" --> ")
                    .map(timeToSeconds);
                  const isCurrentSubtitle =
                    currentTime >= startTime && currentTime <= endTime;

                  return (
                    <Grid item xs={12} key={subtitle.index}>
                      <Card
                        variant="outlined"
                        ref={(el) =>
                          (subtitleRefs.current[subtitle.index] = el)
                        }
                        sx={{
                          borderColor: isCurrentSubtitle
                            ? "primary.main"
                            : "inherit",
                          transition: "all 0.3s ease",
                          transform: isCurrentSubtitle
                            ? "scale(1.01)"
                            : "scale(1)",
                          boxShadow: isCurrentSubtitle ? 2 : 0,
                        }}
                      >
                        <CardContent>
                          <Box mb={1}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              #{subtitle.index} • {subtitle.timecode}
                            </Typography>
                          </Box>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              value={subtitle.text}
                              onChange={(e) =>
                                handleTextUpdate(index, e.target.value)
                              }
                              sx={{
                                backgroundColor: theme.palette.background.paper,
                              }}
                            />
                          ) : (
                            <Typography>{subtitle.text}</Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Box mt={4}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={generateSrtFile}
                  disabled={isEditing}
                  fullWidth
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    maxWidth: { xs: "100%", sm: "220px" },
                  }}
                >
                  Download SRT
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<TranslateIcon />}
                  onClick={generateConvertedSrtFile}
                  disabled={isEditing}
                  fullWidth
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    maxWidth: { xs: "100%", sm: "220px" },
                  }}
                >
                  Download Converted SRT
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VideoToSrt;
