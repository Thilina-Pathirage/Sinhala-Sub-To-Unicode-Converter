import React from "react";
import {
  Typography,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const Footer = () => (
    <Paper
      style={{
        padding: "10px 0",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        marginTop: "20px",
      }}
      elevation={3}
    >
      <Typography variant="body2">
        Created by <strong>Thilina Pathirage</strong>
      </Typography>
      <Box mt={1}>
        <IconButton
          color="inherit"
          onClick={() =>
            window.open(
              "https://youtube.com/@thilina.x?si=4ZJiSeXQgg4l1RRP",
              "_blank"
            )
          }
        >
          <YouTubeIcon />
        </IconButton>
        <IconButton
          color="inherit"
          onClick={() =>
            window.open(
              "https://www.tiktok.com/@thilina.p?_t=8qo8oPo20Ej&_r=1",
              "_blank"
            )
          }
        >
          <MusicNoteIcon />
        </IconButton>
      </Box>
    </Paper>
  );


export default Footer;