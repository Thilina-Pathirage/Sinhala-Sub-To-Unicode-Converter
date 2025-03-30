// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import Footer from "../Components/Footer";
import { handleSRTConversion } from "../utils/subtitleUtils";

function HomePage() {
  const [convertedText, setConvertedText] = useState("");
  const [fileName, setFileName] = useState("");

  // Google Analytics tracking ID
  const GA_TRACKING_ID = "G-P958NX2ZXX";

  // Load Google Analytics script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", GA_TRACKING_ID);

    return () => {
      document.head.removeChild(script);
    };
  }, [GA_TRACKING_ID]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const convertedContent = handleSRTConversion(content);
        setConvertedText(convertedContent);
      };
      reader.readAsText(file, "utf-8");
    }
  };

  

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([convertedText], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `converted_${fileName}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px", marginBottom: "80px" }}>
      <Paper elevation={1} style={{ padding: "40px", borderRadius: "12px" }}>
        <Box marginBottom={2}>
          <Typography variant="h6" align="center">
            Convert Sinhala Subtitle Files to Unicode
          </Typography>
          <Typography
            variant="body2"
            align="center"
            style={{ marginTop: "10px" }}
          >
            This app allows you to upload a .srt subtitle file, convert the
            Sinhala text into Unicode format, and download the converted .srt
            file.
          </Typography>
        </Box>
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <Typography variant="body1" align="center">
              Upload a .srt subtitle file:
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop={2}
            >
              <IconButton color="primary" component="label">
                <CloudUploadIcon fontSize="large" />
                <input
                  type="file"
                  hidden
                  accept=".srt"
                  onChange={handleFileUpload}
                />
              </IconButton>
            </Box>
          </Grid>
          {convertedText && (
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                fullWidth
                size="large"
                style={{ textTransform: "none", borderRadius: "50px" }}
              >
                Download
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
      <Footer />
    </Container>
  );
}

export default HomePage;