// src/pages/VideoToSrtNew.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Paper,
  Box,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import TranslateIcon from "@mui/icons-material/Translate";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
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
import { alpha } from "@mui/material/styles";

const VideoToSrtNew = () => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [srtData, setSrtData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [dbHealthy, setDbHealthy] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [showWaveform, setShowWaveform] = useState(true);
  const [isTimelineScrubbing, setIsTimelineScrubbing] = useState(false);
  const subtitleRefs = useRef({});
  const timelineRef = useRef(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [activeResize, setActiveResize] = useState(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0 });
  const [initialTime, setInitialTime] = useState({ start: 0, end: 0 });

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const healthCheck = await checkDBHealth();
        setDbHealthy(healthCheck.healthy);
        
        if (!healthCheck.healthy) {
          console.warn("IndexedDB not available, using fallback storage:", healthCheck.message);
          setUseFallback(true);
          
          const savedSrt = await fallbackStorage.getSrtData();
          if (savedSrt) {
            setSrtData(savedSrt.data);
          }
          return;
        }

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

    // Handle window resize for responsive video dimensions
    const handleResize = () => {
      // Force re-render to recalculate video dimensions
      if (videoDimensions.width && videoDimensions.height) {
        setVideoDimensions(prev => ({ ...prev }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [videoDimensions.width, videoDimensions.height]);

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

  const secondsToTimeString = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  // Calculate video display dimensions based on aspect ratio
  const getVideoDisplayDimensions = () => {
    if (!videoDimensions.width || !videoDimensions.height) {
      return { width: 800, height: 450 }; // Default 16:9 aspect ratio
    }

    const aspectRatio = videoDimensions.width / videoDimensions.height;
    
    // Responsive max dimensions based on screen size
    const maxWidth = Math.min(window.innerWidth * 0.6, 1000);
    const maxHeight = Math.min(window.innerHeight * 0.6, 600);
    const minWidth = 400;
    const minHeight = 225;

    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;

    // If height exceeds max, scale down based on height
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    // Ensure minimum dimensions
    if (displayWidth < minWidth) {
      displayWidth = minWidth;
      displayHeight = minWidth / aspectRatio;
    }

    if (displayHeight < minHeight) {
      displayHeight = minHeight;
      displayWidth = minHeight * aspectRatio;
    }

    return {
      width: Math.round(displayWidth),
      height: Math.round(displayHeight),
    };
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleTimelineZoom = (direction) => {
    setTimelineZoom(prev => {
      const newZoom = direction === 'in' ? Math.min(prev * 1.5, 10) : Math.max(prev / 1.5, 0.1);
      return newZoom;
    });
  };

  const handleTimelineReset = () => {
    setTimelineZoom(1);
  };

  const formatTimecode = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const generateTimelineMarkers = () => {
    const markers = [];
    const step = Math.max(1, Math.floor(10 / timelineZoom)); // Adaptive step based on zoom
    for (let i = 0; i <= duration; i += step) {
      markers.push(i);
    }
    return markers;
  };

  const handleVolumeChange = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
    }
  };

  const getCurrentSubtitle = () => {
    return srtData.find((subtitle) => {
      const [start, end] = subtitle.timecode.split(" --> ").map(timeToSeconds);
      return currentTime >= start && currentTime <= end;
    });
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
      if (dbHealthy && !useFallback) {
        try {
          await saveVideo(file);
          setVideoUrl(URL.createObjectURL(file));
        } catch (dbError) {
          console.warn("Failed to save video to IndexedDB:", dbError.message);
          setUseFallback(true);
          setDbHealthy(false);
          setError(`Video won't be saved for next session: ${dbError.message}`);
          setVideoUrl(URL.createObjectURL(file));
        }
      } else {
        setVideoUrl(URL.createObjectURL(file));
      }

      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch(
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

      try {
        if (useFallback) {
          await fallbackStorage.saveSrtData(parsedSrt);
        } else {
          await saveSrtData(parsedSrt);
        }
      } catch (saveError) {
        console.warn("Failed to save SRT data:", saveError.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextUpdate = async (index, value) => {
    const newData = [...srtData];
    const dataIndex = newData.findIndex(item => item.index === index);
    if (dataIndex !== -1) {
      newData[dataIndex].text = value;
      setSrtData(newData);

      try {
        if (useFallback) {
          await fallbackStorage.saveSrtData(newData);
        } else {
          await saveSrtData(newData);
        }
      } catch (error) {
        console.error("Error saving SRT data:", error);
      }
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
      setEditingIndex(null);
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

  const currentSubtitle = getCurrentSubtitle();

  // Convert seconds to SRT timecode format
  const secondsToTimecode = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Update subtitle timecode
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

    try {
      if (useFallback) {
        await fallbackStorage.saveSrtData(newData);
      } else {
        await saveSrtData(newData);
      }
    } catch (error) {
      console.error("Error saving updated subtitle times:", error);
      setError("Failed to save subtitle changes");
    }
  };

  // Handle mouse down for dragging
  const handleDragStart = (e, index, type) => {
    if (!isEditing) return; // Only allow drag/resize in edit mode
    
    e.stopPropagation();
    e.preventDefault();
    console.log('Drag start:', { index, type });
    
    const rect = timelineRef.current.getBoundingClientRect();
    const subtitle = srtData[index];
    const [start, end] = subtitle.timecode.split(" --> ").map(timeToSeconds);
    
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
    const pixelsPerSecond = (rect.width / duration) * timelineZoom;
    const timeDiff = (e.clientX - rect.left - initialMousePos.x) / pixelsPerSecond;
    
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
  }, [activeDrag, activeResize, initialMousePos, initialTime, duration, timelineZoom]);

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

  if (!videoUrl) {
    // Upload Interface
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
            Professional Video Editor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Upload your video to get started with automatic subtitle generation and professional editing tools.
          </Typography>

          {!dbHealthy && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.warning.light,
                color: theme.palette.warning.contrastText,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body2">
                ⚠️ Limited storage mode: Videos won't be saved for next session
              </Typography>
            </Box>
          )}

          <input
            accept="video/*"
            style={{ display: "none" }}
            id="video-upload"
            type="file"
            onChange={handleVideoUpload}
          />

          <label htmlFor="video-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              size="large"
              sx={{
                borderRadius: 8,
                px: 6,
                py: 2,
                textTransform: "none",
                fontSize: '1.1rem',
              }}
            >
              {loading ? "Processing..." : "Upload Video"}
            </Button>
          </label>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {loading && (
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Generating subtitles...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  // Professional Video Editor Interface
  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Toolbar */}
      <AppBar position="static" sx={{ 
        backgroundColor: theme.palette.background.paper, 
        boxShadow: 'none', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}>
        <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 500 }}>
            Professional Video Editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleClearData}
              sx={{ 
                color: theme.palette.error.main, 
                border: `1px solid ${theme.palette.error.main}`, 
                borderRadius: 1 
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={generateSrtFile}
              size="small"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Export SRT
            </Button>
            <Button
              variant="contained"
              startIcon={<TranslateIcon />}
              onClick={generateConvertedSrtFile}
              size="small"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Export Unicode
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Subtitle List */}
        <Box
          sx={{
            width: 320,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: theme.palette.text.primary }}>
              Subtitles ({srtData.length})
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {srtData.map((subtitle, index) => {
                const [startTime, endTime] = subtitle.timecode.split(" --> ").map(timeToSeconds);
                const isActive = currentTime >= startTime && currentTime <= endTime;
                const isEditing = editingIndex === subtitle.index;

                return (
                                     <ListItem
                     key={subtitle.index}
                     sx={{
                       flexDirection: 'column',
                       alignItems: 'stretch',
                       px: 2,
                       py: 1,
                       borderBottom: `1px solid ${theme.palette.divider}`,
                       backgroundColor: isActive ? theme.palette.primary.main + '40' : 'transparent',
                       cursor: 'pointer',
                       '&:hover': {
                         backgroundColor: isActive ? theme.palette.primary.main + '40' : theme.palette.action.hover,
                       },
                     }}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = startTime;
                        setCurrentTime(startTime);
                      }
                    }}
                  >
                                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                       <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                         #{subtitle.index} • {subtitle.timecode.split(' --> ')[0]}
                       </Typography>
                       <IconButton
                         size="small"
                         onClick={(e) => {
                           e.stopPropagation();
                           setEditingIndex(isEditing ? null : subtitle.index);
                         }}
                         sx={{ color: isEditing ? theme.palette.success.main : theme.palette.text.secondary }}
                       >
                         {isEditing ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                       </IconButton>
                     </Box>
                    
                                         {isEditing ? (
                       <TextField
                         fullWidth
                         multiline
                         value={subtitle.text}
                         onChange={(e) => handleTextUpdate(subtitle.index, e.target.value)}
                         onClick={(e) => e.stopPropagation()}
                         sx={{
                           '& .MuiInputBase-root': {
                             backgroundColor: theme.palette.action.selected,
                             color: theme.palette.text.primary,
                             fontSize: '0.85rem',
                           },
                         }}
                         autoFocus
                       />
                     ) : (
                       <Typography
                         variant="body2"
                         sx={{
                           color: isActive ? theme.palette.text.primary : theme.palette.text.secondary,
                           fontSize: '0.85rem',
                           lineHeight: 1.4,
                           fontWeight: isActive ? 500 : 400,
                         }}
                       >
                         {subtitle.text}
                       </Typography>
                     )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>

                 {/* Center - Video Player */}
         <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#f5f5f5' }}>
           {/* Video Info Bar */}
           {videoDimensions.width && videoDimensions.height && (
             <Box sx={{ 
               backgroundColor: theme.palette.background.paper, 
               px: 2, 
               py: 1, 
               borderBottom: `1px solid ${theme.palette.divider}`,
               display: 'flex',
               alignItems: 'center',
               gap: 2
             }}>
               <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                 {videoDimensions.width}×{videoDimensions.height} • {(videoDimensions.width/videoDimensions.height).toFixed(2)}:1
               </Typography>
               <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontSize: '0.85rem' }}>
                 Display: {getVideoDisplayDimensions().width}×{getVideoDisplayDimensions().height}
               </Typography>
             </Box>
           )}
           
           <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
             <video
               ref={videoRef}
               src={videoUrl}
               onTimeUpdate={handleTimeUpdate}
               onLoadedMetadata={handleLoadedMetadata}
               onPlay={() => setIsPlaying(true)}
               onPause={() => setIsPlaying(false)}
                                style={{
                   width: `${getVideoDisplayDimensions().width}px`,
                   height: `${getVideoDisplayDimensions().height}px`,
                   borderRadius: '8px',
                   boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                   border: `1px solid ${theme.palette.divider}`,
                 }}
             />
            
                         {/* Subtitle Overlay */}
             {currentSubtitle && (
               <Box
                 sx={{
                   position: 'absolute',
                   bottom: 80,
                   left: '50%',
                   transform: 'translateX(-50%)',
                   backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                   color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                   px: 3,
                   py: 1.5,
                   borderRadius: 2,
                   maxWidth: `${Math.min(getVideoDisplayDimensions().width * 0.9, 600)}px`,
                   textAlign: 'center',
                   border: `1px solid ${theme.palette.divider}`,
                   backdropFilter: 'blur(4px)',
                   boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                 }}
               >
                 <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.3 }}>
                   {currentSubtitle.text}
                 </Typography>
               </Box>
             )}
          </Box>
        </Box>
      </Box>

      {/* Professional Timeline */}
      <Box
        sx={{
          height: 180,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Timeline Header Controls */}
        <Box sx={{ 
          height: 48, 
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex', 
          alignItems: 'center', 
          px: 2, 
          gap: 2,
          boxShadow: theme.palette.mode === 'dark' ? 'inset 0 -1px 0 rgba(255,255,255,0.1)' : 'inset 0 -1px 0 rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          {/* Left Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {/* Timeline Zoom Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={() => handleTimelineZoom('out')}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Chip 
                label={`${Math.round(timelineZoom * 100)}%`}
                size="small"
                variant="outlined"
                sx={{ minWidth: 65, fontSize: '0.75rem' }}
              />
              
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={() => handleTimelineZoom('in')}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fit to Timeline">
                <IconButton size="small" onClick={handleTimelineReset}>
                  <FitScreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Waveform Toggle */}
            <Tooltip title="Toggle Waveform">
              <IconButton 
                size="small" 
                onClick={() => setShowWaveform(!showWaveform)}
                sx={{ color: showWaveform ? theme.palette.primary.main : theme.palette.text.secondary }}
              >
                <GraphicEqIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Center Controls */}
          <Box sx={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            {/* Transport Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={isPlaying ? "Pause" : "Play"}>
                <IconButton 
                  onClick={handlePlayPause} 
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {isPlaying 
                    ? <PauseIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} /> 
                    : <PlayArrowIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                  }
                </IconButton>
              </Tooltip>

              {/* Edit Toggle Button */}
              <Tooltip title={isEditing ? "Save Changes" : "Edit Timeline"}>
                <IconButton
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{
                    backgroundColor: isEditing
                      ? theme.palette.mode === 'dark'
                        ? alpha(theme.palette.success.main, 0.2)
                        : alpha(theme.palette.success.main, 0.1)
                      : theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                    color: isEditing ? theme.palette.success.main : theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: isEditing
                        ? theme.palette.mode === 'dark'
                          ? alpha(theme.palette.success.main, 0.3)
                          : alpha(theme.palette.success.main, 0.2)
                        : theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.3)
                          : alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                    border: `1px solid ${isEditing 
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.2)}`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {isEditing 
                    ? <SaveIcon sx={{ fontSize: 20, color: 'inherit' }} />
                    : <EditIcon sx={{ fontSize: 20, color: 'inherit' }} />
                  }
                </IconButton>
              </Tooltip>
            </Box>

            {/* Timecode Display */}
            <Box sx={{ 
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.1)
                : alpha(theme.palette.background.paper, 0.8),
              px: 2,
              py: 0.75,
              borderRadius: '8px',
              fontFamily: 'monospace',
              minWidth: 200,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 500, 
                  fontSize: '0.85rem',
                  color: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.9)
                    : theme.palette.primary.main,
                  letterSpacing: '0.5px',
                }}
              >
                {formatTimecode(currentTime)} / {formatTimecode(duration || 0)}
              </Typography>
            </Box>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpIcon sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }} />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{ 
                  width: 80, 
                  color: theme.palette.primary.main,
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  }
                }}
              />
              <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
                {Math.round(volume * 100)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Timeline Area */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            cursor: isEditing ? 'pointer' : 'default',
            border: isEditing ? `2px solid ${theme.palette.primary.main}` : 'none',
          }}
          ref={timelineRef}
          onClick={(e) => {
            if (!isEditing) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            if (videoRef.current) {
              videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
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

          {/* Waveform Background */}
          {showWaveform && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.palette.mode === 'dark' 
                ? `repeating-linear-gradient(
                    90deg,
                    rgba(144, 202, 249, 0.1) 0px,
                    rgba(144, 202, 249, 0.15) 3px,
                    rgba(144, 202, 249, 0.05) 6px,
                    rgba(144, 202, 249, 0.2) 9px,
                    rgba(144, 202, 249, 0.1) 12px
                  )`
                : `repeating-linear-gradient(
                    90deg,
                    rgba(25, 118, 210, 0.1) 0px,
                    rgba(25, 118, 210, 0.15) 3px,
                    rgba(25, 118, 210, 0.05) 6px,
                    rgba(25, 118, 210, 0.2) 9px,
                    rgba(25, 118, 210, 0.1) 12px
                  )`,
              animation: isPlaying ? 'waveform 1.5s ease-in-out infinite' : 'none',
              '@keyframes waveform': {
                '0%': { transform: 'scaleY(0.8)', opacity: 0.6 },
                '50%': { transform: 'scaleY(1.2)', opacity: 1 },
                '100%': { transform: 'scaleY(0.8)', opacity: 0.6 },
              },
            }} />
          )}

          {/* Time markers */}
          {duration > 0 && Array.from({ length: Math.ceil(duration) }).map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                left: `${(i / duration) * 100 * timelineZoom}%`,
                top: 0,
                height: i % 10 === 0 ? '14px' : '8px',
                width: i % 10 === 0 ? 1.5 : 1,
                bgcolor: theme.palette.mode === 'dark'
                  ? i % 10 === 0 
                    ? alpha(theme.palette.primary.main, 0.9)
                    : alpha(theme.palette.primary.main, 0.5)
                  : i % 10 === 0
                    ? alpha(theme.palette.primary.main, 0.9)
                    : alpha(theme.palette.primary.main, 0.4),
                transition: 'all 0.2s ease',
                zIndex: 2,
              }}
            >
              {i % 10 === 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 4,
                    top: 2,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.9)
                      : theme.palette.primary.main,
                    fontFamily: 'monospace',
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.paper, 0.9)
                      : alpha(theme.palette.background.paper, 0.9),
                    px: 0.75,
                    py: 0.25,
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`
                      : `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                >
                  {Math.floor(i / 60)}:{(i % 60).toString().padStart(2, '0')}
                </Typography>
              )}
            </Box>
          ))}

          {/* Playhead */}
          <Box
            sx={{
              position: 'absolute',
              left: `${(currentTime / duration) * 100 * timelineZoom}%`,
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
            const leftPercent = (start / duration) * 100 * timelineZoom;
            const widthPercent = ((end - start) / duration) * 100 * timelineZoom;
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
                  height: 52,
                  bgcolor: theme.palette.mode === 'dark'
                    ? isActive 
                      ? alpha(theme.palette.primary.main, 0.8)
                      : alpha(theme.palette.primary.main, 0.4)
                    : isActive
                      ? alpha(theme.palette.primary.main, 0.8)
                      : alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isEditing ? 'move' : 'default',
                  zIndex: isActive || isDragging || isResizing ? 2 : 1,
                  transition: isDragging || isResizing ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                  '&:hover': isEditing ? {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  } : {},
                  opacity: isDragging || isResizing ? 0.8 : 1,
                  userSelect: 'none',
                  border: isEditing 
                    ? `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.5 : 0.3)}`
                    : 'none',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isActive 
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.25)}`
                    : 'none',
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
                        width: 8,
                        height: '100%',
                        cursor: 'w-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px 0 0 6px',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                        transition: 'background-color 0.2s ease',
                        zIndex: 3,
                      }}
                      onMouseDown={(e) => handleDragStart(e, index, 'left')}
                    >
                      <DragIndicatorIcon sx={{ 
                        fontSize: 14,
                        color: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.9)
                          : theme.palette.primary.main,
                        transform: 'rotate(90deg)',
                        opacity: 0.8,
                      }} />
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: 8,
                        height: '100%',
                        cursor: 'e-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0 6px 6px 0',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                        transition: 'background-color 0.2s ease',
                        zIndex: 3,
                      }}
                      onMouseDown={(e) => handleDragStart(e, index, 'right')}
                    >
                      <DragIndicatorIcon sx={{ 
                        fontSize: 14,
                        color: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.9)
                          : theme.palette.primary.main,
                        transform: 'rotate(90deg)',
                        opacity: 0.8,
                      }} />
                    </Box>
                  </>
                )}

                <Stack spacing={0.5} sx={{ width: '100%', px: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.common.white
                        : theme.palette.common.black,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      opacity: 0.9,
                      textAlign: 'center',
                    }}
                  >
                    #{subtitle.index}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.common.white
                        : theme.palette.common.black,
                      fontSize: '0.7rem',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                      opacity: 0.9,
                    }}
                  >
                    {subtitle.text}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoToSrtNew; 