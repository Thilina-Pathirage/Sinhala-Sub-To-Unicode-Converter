// src/pages/VideoToSrt.jsx
import React, { useState } from "react";
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
import { useTheme } from "@mui/material/styles";
import Footer from "../Components/Footer";
import { handleSRTConversion } from "../utils/subtitleUtils";

const VideoToSrt = () => {
  const theme = useTheme();
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [srtData, setSrtData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

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

    setVideoFile(file);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(
        `https://flask-hello-world-ten-psi-76.vercel.app/upload`,
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

  const handleTextUpdate = (index, value) => {
    const newData = [...srtData];
    newData[index].text = value;
    setSrtData(newData);
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
      maxWidth="sm"
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

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 4, px: 2 }}
        >
          Upload your video and get automatic subtitles with our advanced speech
          recognition. You can edit the generated subtitles before downloading
          the SRT file. Perfect for creating accurate subtitles for your videos
          in Sinhala language.
        </Typography>

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

        {srtData.length > 0 && (
          <>
            <Box
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Subtitle Editor</Typography>
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

            <Grid container spacing={2}>
              {srtData.map((subtitle, index) => (
                <Grid item xs={12} key={subtitle.index}>
                  <Card variant="outlined">
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
              ))}
            </Grid>

            <Box mt={4}>
              <Typography
                align="center"
                color="text.secondary"
                sx={{ mb: 2, px: 2 }}
              >
                All set with your edits? Click below to download your subtitle
                file in SRT format, compatible with most video players and
                editing software.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={generateSrtFile}
                  disabled={isEditing}
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
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
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                  }}
                >
                  Download Converted SRT
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Paper>
      <Footer />
    </Container>
  );
};

export default VideoToSrt;
