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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import TranslateIcon from "@mui/icons-material/Translate";
import DeleteIcon from "@mui/icons-material/Delete";
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
        `https://srtapi.wizqo.club/upload`,
        // `http://127.0.0.1:5000/upload`,
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
  };

  const handleSaveAll = () => {
    setIsEditing(false);
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
