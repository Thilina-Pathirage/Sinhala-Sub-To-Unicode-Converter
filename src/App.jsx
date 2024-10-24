import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Box,
  CssBaseline,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
function App() {
  const [convertedText, setConvertedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [darkMode, setDarkMode] = useState(true); // State for theme

  // Create themes for dark and light modes
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#90caf9",
      },
      background: {
        default: "#121212",
        paper: "#1e1e1e",
      },
      text: {
        primary: "#ffffff",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h4: {
        fontWeight: 600,
      },
      body1: {
        fontSize: "1.1rem",
      },
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#000000",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h4: {
        fontWeight: 600,
      },
      body1: {
        fontSize: "1.1rem",
      },
    },
  });

  // Function to toggle theme
  const handleThemeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const sinhalaToUnicode = (inputText) => {
    let sftext = inputText;

    sftext = sftext.replace(/,/g, "￦");
    sftext = sftext.replace(/\./g, "’");
    sftext = sftext.replace(/\(/g, "￫");
    sftext = sftext.replace(/\)/g, "￩");
    sftext = sftext.replace(/%/g, "ￕ");
    sftext = sftext.replace(/\//g, "$");
    sftext = sftext.replace(/–/g, "ￔ");
    sftext = sftext.replace(/\?/g, "ￓ");
    sftext = sftext.replace(/!/g, "ￒ");
    sftext = sftext.replace(/\=/g, "ￏ");
    sftext = sftext.replace(/\'/g, "ￎ");
    sftext = sftext.replace(/\+/g, "ￍ");
    sftext = sftext.replace(/\:/g, "ￌ");
    sftext = sftext.replace(/\÷/g, "ￋ");
    sftext = sftext.replace(/\;/g, "ﾶ");
    sftext = sftext.replace(/ත්‍රෛ/g, "ff;%");
    sftext = sftext.replace(/ශෛ/g, "ffY");
    sftext = sftext.replace(/චෛ/g, "ffp");
    sftext = sftext.replace(/ජෛ/g, "ffc");
    sftext = sftext.replace(/කෛ/g, "ffl");
    sftext = sftext.replace(/මෛ/g, "ffu");
    sftext = sftext.replace(/පෛ/g, "ffm");
    sftext = sftext.replace(/දෛ/g, "ffo");
    sftext = sftext.replace(/තෛ/g, "ff;");
    sftext = sftext.replace(/නෛ/g, "ffk");
    sftext = sftext.replace(/ධෛ/g, "ffO");
    sftext = sftext.replace(/වෛ/g, "ffj");
    sftext = sftext.replace(/ප්‍රෞ/g, "fm%!");
    sftext = sftext.replace(/ෂ්‍යෝ/g, "fIHda");
    sftext = sftext.replace(/ඡ්‍යෝ/g, "fPHda");
    sftext = sftext.replace(/ඪ්‍යෝ/g, "fVHda");
    sftext = sftext.replace(/ඝ්‍යෝ/g, "f>Hda");
    sftext = sftext.replace(/ඛ්‍යෝ/g, "fLHda");
    sftext = sftext.replace(/ළ්‍යෝ/g, "f<Hda");
    sftext = sftext.replace(/ඵ්‍යෝ/g, "fMHda");
    sftext = sftext.replace(/ඨ්‍යෝ/g, "fGHda");
    sftext = sftext.replace(/ශ්‍යෝ/g, "fYHda");
    sftext = sftext.replace(/ක්‍ෂ්‍යෝ/g, "fÌHda");
    sftext = sftext.replace(/බ්‍යෝ/g, "fnHda");
    sftext = sftext.replace(/ච්‍යෝ/g, "fpHda");
    sftext = sftext.replace(/ඩ්‍යෝ/g, "fâHda");
    sftext = sftext.replace(/ෆ්‍යෝ/g, "f*Hda");
    sftext = sftext.replace(/ග්‍යෝ/g, "f.Hda");
    sftext = sftext.replace(/ජ්‍යෝ/g, "fcHda");
    sftext = sftext.replace(/ක්‍යෝ/g, "flHda");
    sftext = sftext.replace(/ල්‍යෝ/g, "f,Hda");
    sftext = sftext.replace(/ම්‍යෝ/g, "fuHda");
    sftext = sftext.replace(/න්‍යෝ/g, "fkHda");
    sftext = sftext.replace(/ප්‍යෝ/g, "fmHda");
    sftext = sftext.replace(/ද්‍යෝ/g, "foHda");
    sftext = sftext.replace(/ස්‍යෝ/g, "fiHda");
    sftext = sftext.replace(/ට්‍යෝ/g, "fgHda");
    sftext = sftext.replace(/ව්‍යෝ/g, "fjHda");
    sftext = sftext.replace(/ත්‍යෝ/g, "f;Hda");
    sftext = sftext.replace(/භ්‍යෝ/g, "fNHda");
    sftext = sftext.replace(/ධ්‍යෝ/g, "fOHda");
    sftext = sftext.replace(/ථ්‍යෝ/g, "f:Hda");
    sftext = sftext.replace(/ෂ්‍යො/g, "fIHd");
    sftext = sftext.replace(/ශ්‍යො/g, "fYHd");
    sftext = sftext.replace(/ඛ්‍යො/g, "fLHd");
    sftext = sftext.replace(/ක්‍ෂ්‍යො/g, "fÌHd");
    sftext = sftext.replace(/බ්‍යො/g, "fnHd");
    sftext = sftext.replace(/ව්‍යො/g, "fjHd");
    sftext = sftext.replace(/ඩ්‍යො/g, "fvHd");
    sftext = sftext.replace(/ෆ්‍යො/g, "f*Hd");
    sftext = sftext.replace(/ග්‍යො/g, "f.Hd");
    sftext = sftext.replace(/ජ්‍යො/g, "fcHd");
    sftext = sftext.replace(/ක්‍යො/g, "flHd");
    sftext = sftext.replace(/ම්‍යො/g, "fuHd");
    sftext = sftext.replace(/ප්‍යො/g, "fmHd");
    sftext = sftext.replace(/ද්‍යො/g, "foHd");
    sftext = sftext.replace(/ස්‍යො/g, "fiHd");
    sftext = sftext.replace(/ට්‍යො/g, "fgHd");
    sftext = sftext.replace(/ව්‍යො/g, "fjHd");
    sftext = sftext.replace(/ත්‍යො/g, "f;Hd");
    sftext = sftext.replace(/භ්‍යො/g, "fNHd");
    sftext = sftext.replace(/ධ්‍යො/g, "fOHd");
    sftext = sftext.replace(/ථ්‍යො/g, "f:Hd");
    sftext = sftext.replace(/ෂ්‍යෙ/g, "fIH");
    sftext = sftext.replace(/ඡ්‍යෙ/g, "fPH");
    sftext = sftext.replace(/ළ්‍යෙ/g, "f<H");
    sftext = sftext.replace(/ණ්‍යෙ/g, "fKH");
    sftext = sftext.replace(/ච්‍යෙ/g, "fpH");
    sftext = sftext.replace(/ල්‍යෙ/g, "f,H");
    sftext = sftext.replace(/න්‍යෙ/g, "fkH");
    sftext = sftext.replace(/ශ්‍යෙ/g, "fYH");
    sftext = sftext.replace(/ඛ්‍යෙ/g, "fLH");
    sftext = sftext.replace(/ක්‍ෂ්යෙ/g, "fÌH");
    sftext = sftext.replace(/බ්‍යෙ/g, "fnH");
    sftext = sftext.replace(/ඩ්‍යෙ/g, "fvH");
    sftext = sftext.replace(/ෆ්‍යෙ/g, "f*H");
    sftext = sftext.replace(/ග්‍යෙ/g, "f.H");
    sftext = sftext.replace(/ජ්‍යෙ/g, "fcH");
    sftext = sftext.replace(/ක්‍යෙ/g, "flH");
    sftext = sftext.replace(/ම්‍යෙ/g, "fuH");
    sftext = sftext.replace(/ප්‍යෙ/g, "fmH");
    sftext = sftext.replace(/ද්‍යෙ/g, "foH");
    sftext = sftext.replace(/ස්‍යෙ/g, "fiH");
    sftext = sftext.replace(/ට්‍යෙ/g, "fgH");
    sftext = sftext.replace(/ව්‍යෙ/g, "fjH");
    sftext = sftext.replace(/ත්‍යෙ/g, "f;H");
    sftext = sftext.replace(/භ්‍යෙ/g, "fNH");
    sftext = sftext.replace(/ධ්‍යෙ/g, "fOH");
    sftext = sftext.replace(/ථ්‍යෙ/g, "f:H");
    sftext = sftext.replace(/ෂ්‍රෝ/g, "fI%da");
    sftext = sftext.replace(/ඝ්‍රෝ/g, "f>%da");
    sftext = sftext.replace(/ශ්‍රෝ/g, "fY%da");
    sftext = sftext.replace(/ක්‍ෂ්‍රෝ/g, "fÌ%da");
    sftext = sftext.replace(/බ්‍රෝ/g, "fn%da");
    sftext = sftext.replace(/ඩ්‍රෝ/g, "fv%da");
    sftext = sftext.replace(/ෆ්‍රෝ/g, "f*%da");
    sftext = sftext.replace(/ග්‍රෝ/g, "f.%da");
    sftext = sftext.replace(/ක්‍රෝ/g, "fl%da");
    sftext = sftext.replace(/ප්‍රෝ/g, "fm%da");
    sftext = sftext.replace(/ද්‍රෝ/g, "føda");
    sftext = sftext.replace(/ස්‍රෝ/g, "fi%da");
    sftext = sftext.replace(/ට්‍රෝ/g, "fg%da");
    sftext = sftext.replace(/ත්‍රෝ/g, "f;%da");
    sftext = sftext.replace(/ශ්‍රො/g, "fY%d");
    sftext = sftext.replace(/ඩ්‍රො/g, "fv%d");
    sftext = sftext.replace(/ෆ්‍රො/g, "f*%d");
    sftext = sftext.replace(/ග්‍රො/g, "f.%d");
    sftext = sftext.replace(/ක්‍රො/g, "fl%d");
    sftext = sftext.replace(/ප්‍රො/g, "fm%d");
    sftext = sftext.replace(/ද්‍රො/g, "fød");
    sftext = sftext.replace(/ස්‍රො/g, "fi%d");
    sftext = sftext.replace(/ට්‍රො/g, "fg%d");
    sftext = sftext.replace(/ත්‍රො/g, "f;%d");
    sftext = sftext.replace(/ශ්‍රේ/g, "fYa%");
    sftext = sftext.replace(/බ්‍රේ/g, "fí%");
    sftext = sftext.replace(/ඩ්‍රේ/g, "fâ%");
    sftext = sftext.replace(/ෆ්‍රේ/g, "f*a%");
    sftext = sftext.replace(/ග්‍රේ/g, "f.a%");
    sftext = sftext.replace(/ක්‍රේ/g, "fla%");
    sftext = sftext.replace(/ප්‍රේ/g, "fma%");
    sftext = sftext.replace(/ද්‍රේ/g, "føa");
    sftext = sftext.replace(/ස්‍රේ/g, "fia%");
    sftext = sftext.replace(/ත්‍රේ/g, "f;a%");
    sftext = sftext.replace(/ධ්‍රේ/g, "fè%");
    sftext = sftext.replace(/ෂ්‍රෙ/g, "fI%");
    sftext = sftext.replace(/ශ්‍රෙ/g, "fY%");
    sftext = sftext.replace(/බ්‍රෙ/g, "fn%");
    sftext = sftext.replace(/ෆ්‍රෙ/g, "f*%");
    sftext = sftext.replace(/ග්‍රෙ/g, "f.%");
    sftext = sftext.replace(/ක්‍රෙ/g, "fl%");
    sftext = sftext.replace(/ප්‍රෙ/g, "fm%");
    sftext = sftext.replace(/ද්‍රෙ/g, "fø");
    sftext = sftext.replace(/ස්‍රෙ/g, "fi%");
    sftext = sftext.replace(/ත්‍රෙ/g, "f;%");
    sftext = sftext.replace(/භ්‍රෙ/g, "fN%");
    sftext = sftext.replace(/ධ්‍රෙ/g, "fO%");
    sftext = sftext.replace(/්‍ය/g, "H");
    sftext = sftext.replace(/්‍ර/g, "%");
    sftext = sftext.replace(/ෂෞ/g, "fI!");
    sftext = sftext.replace(/ඡෞ/g, "fP!");
    sftext = sftext.replace(/ශෞ/g, "fY!");
    sftext = sftext.replace(/බෞ/g, "fn!");
    sftext = sftext.replace(/චෞ/g, "fp!");
    sftext = sftext.replace(/ඩෞ/g, "fv!");
    sftext = sftext.replace(/ෆෞ/g, "f*!");
    sftext = sftext.replace(/ගෞ/g, "f.!");
    sftext = sftext.replace(/ජෞ/g, "fc!");
    sftext = sftext.replace(/කෞ/g, "fl!");
    sftext = sftext.replace(/ලෞ/g, "f,!");
    sftext = sftext.replace(/මෞ/g, "fu!");
    sftext = sftext.replace(/නෞ/g, "fk!");
    sftext = sftext.replace(/පෞ/g, "fm!");
    sftext = sftext.replace(/දෞ/g, "fo!");
    sftext = sftext.replace(/රෞ/g, "fr!");
    sftext = sftext.replace(/සෞ/g, "fi!");
    sftext = sftext.replace(/ටෞ/g, "fg!");
    sftext = sftext.replace(/තෞ/g, "f;!");
    sftext = sftext.replace(/භෞ/g, "fN!");
    sftext = sftext.replace(/ඤෞ/g, "f[!");
    sftext = sftext.replace(/ෂෝ/g, "fIda");
    sftext = sftext.replace(/ඹෝ/g, "fUda");
    sftext = sftext.replace(/ඡෝ/g, "fPda");
    sftext = sftext.replace(/ඪෝ/g, "fVda");
    sftext = sftext.replace(/ඝෝ/g, "f>da");
    sftext = sftext.replace(/ඛෝ/g, "fLda");
    sftext = sftext.replace(/ළෝ/g, "f<da");
    sftext = sftext.replace(/ඟෝ/g, "fÕda");
    sftext = sftext.replace(/ණෝ/g, "fKda");
    sftext = sftext.replace(/ඵෝ/g, "fMda");
    sftext = sftext.replace(/ඨෝ/g, "fGda");
    sftext = sftext.replace(/ඬෝ/g, "fËda");
    sftext = sftext.replace(/ශෝ/g, "fYda");
    sftext = sftext.replace(/ඥෝ/g, "f{da");
    sftext = sftext.replace(/ඳෝ/g, "f|da");
    sftext = sftext.replace(/ක්‍ෂෝ/g, "fÌda");
    sftext = sftext.replace(/බෝ/g, "fnda");
    sftext = sftext.replace(/චෝ/g, "fpda");
    sftext = sftext.replace(/ඩෝ/g, "fvda");
    sftext = sftext.replace(/ෆෝ/g, "f*da");
    sftext = sftext.replace(/ගෝ/g, "f.da");
    sftext = sftext.replace(/හෝ/g, "fyda");
    sftext = sftext.replace(/ජෝ/g, "fcda");
    sftext = sftext.replace(/කෝ/g, "flda");
    sftext = sftext.replace(/ලෝ/g, "f,da");
    sftext = sftext.replace(/මෝ/g, "fuda");
    sftext = sftext.replace(/නෝ/g, "fkda");
    sftext = sftext.replace(/පෝ/g, "fmda");
    sftext = sftext.replace(/දෝ/g, "foda");
    sftext = sftext.replace(/රෝ/g, "frda");
    sftext = sftext.replace(/සෝ/g, "fida");
    sftext = sftext.replace(/ටෝ/g, "fgda");
    sftext = sftext.replace(/වෝ/g, "fjda");
    sftext = sftext.replace(/තෝ/g, "f;da");
    sftext = sftext.replace(/භෝ/g, "fNda");
    sftext = sftext.replace(/යෝ/g, "fhda");
    sftext = sftext.replace(/ඤෝ/g, "f[da");
    sftext = sftext.replace(/ධෝ/g, "fOda");
    sftext = sftext.replace(/ථෝ/g, "f:da");
    sftext = sftext.replace(/ෂො/g, "fId");
    sftext = sftext.replace(/ඹො/g, "fUd");
    sftext = sftext.replace(/ඡො/g, "fPd");
    sftext = sftext.replace(/ඪො/g, "fVd");
    sftext = sftext.replace(/ඝො/g, "f>d");
    sftext = sftext.replace(/ඛො/g, "fLd");
    sftext = sftext.replace(/ළො/g, "f<d");
    sftext = sftext.replace(/ඟො/g, "fÕd");
    sftext = sftext.replace(/ණො/g, "fKd");
    sftext = sftext.replace(/ඵො/g, "fMd");
    sftext = sftext.replace(/ඨො/g, "fGd");
    sftext = sftext.replace(/ඬො/g, "fËd");
    sftext = sftext.replace(/ශො/g, "fYd");
    sftext = sftext.replace(/ඥො/g, "f{d");
    sftext = sftext.replace(/ඳො/g, "f|d");
    sftext = sftext.replace(/ක්‍ෂො/g, "fÌd");
    sftext = sftext.replace(/බො/g, "fnd");
    sftext = sftext.replace(/චො/g, "fpd");
    sftext = sftext.replace(/ඩො/g, "fvd");
    sftext = sftext.replace(/ෆො/g, "f*d");
    sftext = sftext.replace(/ගො/g, "f.d");
    sftext = sftext.replace(/හො/g, "fyd");
    sftext = sftext.replace(/ජො/g, "fcd");
    sftext = sftext.replace(/කො/g, "fld");
    sftext = sftext.replace(/ලො/g, "f,d");
    sftext = sftext.replace(/මො/g, "fud");
    sftext = sftext.replace(/නො/g, "fkd");
    sftext = sftext.replace(/පො/g, "fmd");
    sftext = sftext.replace(/දො/g, "fod");
    sftext = sftext.replace(/රො/g, "frd");
    sftext = sftext.replace(/සො/g, "fid");
    sftext = sftext.replace(/ටො/g, "fgd");
    sftext = sftext.replace(/වො/g, "fjd");
    sftext = sftext.replace(/තො/g, "f;d");
    sftext = sftext.replace(/භො/g, "fNd");
    sftext = sftext.replace(/යො/g, "fhd");
    sftext = sftext.replace(/ඤො/g, "f[d");
    sftext = sftext.replace(/ධො/g, "fOd");
    sftext = sftext.replace(/ථො/g, "f:d");
    sftext = sftext.replace(/ෂේ/g, "fIa");
    sftext = sftext.replace(/ඹේ/g, "fò");
    sftext = sftext.replace(/ඡේ/g, "fþ");
    sftext = sftext.replace(/ඪේ/g, "fa");
    sftext = sftext.replace(/ඝේ/g, "f>a");
    sftext = sftext.replace(/ඛේ/g, "fÄ");
    sftext = sftext.replace(/ළේ/g, "f<a");
    sftext = sftext.replace(/ඟේ/g, "fÕa");
    sftext = sftext.replace(/ණේ/g, "fKa");
    sftext = sftext.replace(/ඵේ/g, "fMa");
    sftext = sftext.replace(/ඨේ/g, "fGa");
    sftext = sftext.replace(/ඬේ/g, "få");
    sftext = sftext.replace(/ශේ/g, "fYa");
    sftext = sftext.replace(/ඥේ/g, "f{a");
    sftext = sftext.replace(/ඳේ/g, "f|a");
    sftext = sftext.replace(/ක්‍ෂේ/g, "fÌa");
    sftext = sftext.replace(/බේ/g, "fí");
    sftext = sftext.replace(/චේ/g, "fÉ");
    sftext = sftext.replace(/ඩේ/g, "fâ");
    sftext = sftext.replace(/ෆේ/g, "f*");
    sftext = sftext.replace(/ගේ/g, "f.a");
    sftext = sftext.replace(/හේ/g, "fya");
    sftext = sftext.replace(/පේ/g, "fma");
    sftext = sftext.replace(/කේ/g, "fla");
    sftext = sftext.replace(/ලේ/g, "f,a");
    sftext = sftext.replace(/මේ/g, "fï");
    sftext = sftext.replace(/නේ/g, "fka");
    sftext = sftext.replace(/ජේ/g, "f–");
    sftext = sftext.replace(/දේ/g, "foa");
    sftext = sftext.replace(/රේ/g, "f¾");
    sftext = sftext.replace(/සේ/g, "fia");
    sftext = sftext.replace(/ටේ/g, "fÜ");
    sftext = sftext.replace(/වේ/g, "fõ");
    sftext = sftext.replace(/තේ/g, "f;a");
    sftext = sftext.replace(/භේ/g, "fNa");
    sftext = sftext.replace(/යේ/g, "fha");
    sftext = sftext.replace(/ඤේ/g, "f[a");
    sftext = sftext.replace(/ධේ/g, "fè");
    sftext = sftext.replace(/ථේ/g, "f:a");
    sftext = sftext.replace(/ෂෙ/g, "fI");
    sftext = sftext.replace(/ඹෙ/g, "fU");
    sftext = sftext.replace(/ඓ/g, "ft");
    sftext = sftext.replace(/ඡෙ/g, "fP");
    sftext = sftext.replace(/ඪෙ/g, "fV");
    sftext = sftext.replace(/ඝෙ/g, "f>");
    sftext = sftext.replace(/ඛෙ/g, "fn");
    sftext = sftext.replace(/ළෙ/g, "f<");
    sftext = sftext.replace(/ඟෙ/g, "fÕ");
    sftext = sftext.replace(/ණෙ/g, "fK");
    sftext = sftext.replace(/ඵෙ/g, "fM");
    sftext = sftext.replace(/ඨෙ/g, "fG");
    sftext = sftext.replace(/ඬෙ/g, "fË");
    sftext = sftext.replace(/ශෙ/g, "fY");
    sftext = sftext.replace(/ඥෙ/g, "f{");
    sftext = sftext.replace(/ඳෙ/g, "fË");
    sftext = sftext.replace(/ක්‍ෂෙ/g, "fÌ");
    sftext = sftext.replace(/බෙ/g, "fn");
    sftext = sftext.replace(/චෙ/g, "fp");
    sftext = sftext.replace(/ඩෙ/g, "fv");
    sftext = sftext.replace(/ෆෙ/g, "f*");
    sftext = sftext.replace(/ගෙ/g, "f.");
    sftext = sftext.replace(/හෙ/g, "fy");
    sftext = sftext.replace(/ජෙ/g, "fc");
    sftext = sftext.replace(/කෙ/g, "fl");
    sftext = sftext.replace(/ලෙ/g, "f,");
    sftext = sftext.replace(/මෙ/g, "fu");
    sftext = sftext.replace(/නෙ/g, "fk");
    sftext = sftext.replace(/පෙ/g, "fm");
    sftext = sftext.replace(/දෙ/g, "fo");
    sftext = sftext.replace(/රෙ/g, "fr");
    sftext = sftext.replace(/සෙ/g, "fi");
    sftext = sftext.replace(/ටෙ/g, "fg");
    sftext = sftext.replace(/වෙ/g, "fj");
    sftext = sftext.replace(/තෙ/g, "f;");
    sftext = sftext.replace(/භෙ/g, "fN");
    sftext = sftext.replace(/යෙ/g, "fh");
    sftext = sftext.replace(/ඤෙ/g, "f[");
    sftext = sftext.replace(/ධෙ/g, "fO");
    sftext = sftext.replace(/ථෙ/g, "f:");
    sftext = sftext.replace(/තු/g, ";=");
    sftext = sftext.replace(/ගු/g, ".=");
    sftext = sftext.replace(/කු/g, "l=");
    sftext = sftext.replace(/තූ/g, ";+");
    sftext = sftext.replace(/ගූ/g, ".+");
    sftext = sftext.replace(/කූ/g, "l+");
    sftext = sftext.replace(/රු/g, "re");
    sftext = sftext.replace(/රූ/g, "rE");
    sftext = sftext.replace(/ආ/g, "wd");
    sftext = sftext.replace(/ඇ/g, "we");
    sftext = sftext.replace(/ඈ/g, "wE");
    sftext = sftext.replace(/ඌ/g, "W!");
    sftext = sftext.replace(/ඖ/g, "T!");
    sftext = sftext.replace(/ඒ/g, "ta");
    sftext = sftext.replace(/ඕ/g, "´");
    sftext = sftext.replace(/ඳි/g, "¢");
    sftext = sftext.replace(/ඳී/g, "£");
    sftext = sftext.replace(/දූ/g, "¥");
    sftext = sftext.replace(/දී/g, "§");
    sftext = sftext.replace(/ලූ/g, "Æ");
    sftext = sftext.replace(/ර්‍ය/g, "©");
    sftext = sftext.replace(/ඳූ/g, "ª");
    sftext = sftext.replace(/ර්/g, "¾");
    sftext = sftext.replace(/ඨි/g, "À");
    sftext = sftext.replace(/ඨී/g, "Á");
    sftext = sftext.replace(/ඡී/g, "Â");
    sftext = sftext.replace(/ඛ්/g, "Ä");
    sftext = sftext.replace(/ඛි/g, "Å");
    sftext = sftext.replace(/ලු/g, "¨");
    sftext = sftext.replace(/ඛී/g, "Ç");
    sftext = sftext.replace(/දි/g, "È");
    sftext = sftext.replace(/ච්/g, "É");
    sftext = sftext.replace(/ජ්/g, "Ê");
    sftext = sftext.replace(/රී/g, "Í");
    sftext = sftext.replace(/ඪී/g, "Î");
    sftext = sftext.replace(/ඪී/g, "Ð,");
    sftext = sftext.replace(/චි/g, "Ñ");
    sftext = sftext.replace(/ථී/g, "Ò");
    sftext = sftext.replace(/ථී/g, "Ó");
    sftext = sftext.replace(/ජී/g, "Ô");
    sftext = sftext.replace(/චී/g, "Ö");
    sftext = sftext.replace(/ඞ්/g, "Ù");
    sftext = sftext.replace(/ඵී/g, "Ú");
    sftext = sftext.replace(/ට්/g, "Ü");
    sftext = sftext.replace(/ඵි/g, "Ý");
    sftext = sftext.replace(/රි/g, "ß");
    sftext = sftext.replace(/ටී/g, "à");
    sftext = sftext.replace(/ටි/g, "á");
    sftext = sftext.replace(/ඩ්/g, "â");
    sftext = sftext.replace(/ඩී/g, "ã");
    sftext = sftext.replace(/ඩි/g, "ä");
    sftext = sftext.replace(/ඬ්/g, "å");
    sftext = sftext.replace(/ඬි/g, "ç");
    sftext = sftext.replace(/ධ්/g, "è");
    sftext = sftext.replace(/ඬී/g, "é");
    sftext = sftext.replace(/ධි/g, "ê");
    sftext = sftext.replace(/ධී/g, "ë");
    sftext = sftext.replace(/බි/g, "ì");
    sftext = sftext.replace(/බ්/g, "í");
    sftext = sftext.replace(/බී/g, "î");
    sftext = sftext.replace(/ම්/g, "ï");
    sftext = sftext.replace(/ජි/g, "ð");
    sftext = sftext.replace(/මි/g, "ñ");
    sftext = sftext.replace(/ඹ්/g, "ò");
    sftext = sftext.replace(/මී/g, "ó");
    sftext = sftext.replace(/ඹි/g, "ô");
    sftext = sftext.replace(/ව්/g, "õ");
    sftext = sftext.replace(/ඹී/g, "ö");
    sftext = sftext.replace(/ඳු/g, "÷");
    sftext = sftext.replace(/ද්‍ර/g, "ø");
    sftext = sftext.replace(/වී/g, "ù");
    sftext = sftext.replace(/වි/g, "ú");
    sftext = sftext.replace(/ඞ්/g, "û");
    sftext = sftext.replace(/ඞී/g, "ü");
    sftext = sftext.replace(/ඡි/g, "ý");
    sftext = sftext.replace(/ඡ්/g, "þ");
    sftext = sftext.replace(/දු/g, "ÿ");
    sftext = sftext.replace(/ජ්/g, "–");
    sftext = sftext.replace(/ර්‍ණ/g, "“");
    sftext = sftext.replace(/ණී/g, "”");
    sftext = sftext.replace(/ජී/g, "„");
    sftext = sftext.replace(/ඡි/g, "‰");
    sftext = sftext.replace(/ඩි/g, "");
    sftext = sftext.replace(/ඤු/g, "™");
    sftext = sftext.replace(/ග/g, ".");
    sftext = sftext.replace(/ළු/g, "¿");
    sftext = sftext.replace(/ෂ/g, "I");
    sftext = sftext.replace(/ං/g, "x");
    sftext = sftext.replace(/ඃ/g, "#");
    sftext = sftext.replace(/ඹ/g, "U");
    sftext = sftext.replace(/ඡ/g, "P");
    sftext = sftext.replace(/ඪ/g, "V");
    sftext = sftext.replace(/ඝ/g, ">");
    sftext = sftext.replace(/ඊ/g, "B");
    sftext = sftext.replace(/ඣ/g, "CO");
    sftext = sftext.replace(/ඛ/g, "L");
    sftext = sftext.replace(/ළ/g, "<");
    sftext = sftext.replace(/ඟ/g, "Õ");
    sftext = sftext.replace(/ණ/g, "K");
    sftext = sftext.replace(/ඵ/g, "M");
    sftext = sftext.replace(/ඨ/g, "G");
    sftext = sftext.replace(/ඃ/g, "#");
    sftext = sftext.replace(/\"/g, ",");
    sftext = sftext.replace(/\//g, "$");
    sftext = sftext.replace(/\)/g, "&");
    sftext = sftext.replace(/:/g, "(");
    sftext = sftext.replace(/-/g, ")");
    sftext = sftext.replace(/ෆ/g, "*");
    sftext = sftext.replace(/ල/g, ",");
    sftext = sftext.replace(/-/g, "-");
    sftext = sftext.replace(/රැ/g, "/");
    sftext = sftext.replace(/ථ/g, ":");
    sftext = sftext.replace(/ත/g, ";");
    sftext = sftext.replace(/ළ/g, "<");
    sftext = sftext.replace(/ඝ/g, ">");
    sftext = sftext.replace(/රෑ/g, "?");
    sftext = sftext.replace(/ඊ/g, "B");
    sftext = sftext.replace(/ක‍/g, "C");
    sftext = sftext.replace(/‍ෘ/g, "D");
    sftext = sftext.replace(/ෑ/g, "E");
    sftext = sftext.replace(/ත‍/g, "F");
    sftext = sftext.replace(/ඨ/g, "G");
    sftext = sftext.replace(/්‍ය/g, "H");
    sftext = sftext.replace(/ෂ/g, "I");
    sftext = sftext.replace(/න‍/g, "J");
    sftext = sftext.replace(/ණ/g, "K");
    sftext = sftext.replace(/ඛ/g, "L");
    sftext = sftext.replace(/ඵ/g, "M");
    sftext = sftext.replace(/භ/g, "N");
    sftext = sftext.replace(/ධ/g, "O");
    sftext = sftext.replace(/ඡ/g, "P");
    sftext = sftext.replace(/ඍ/g, "R");
    sftext = sftext.replace(/ඔ/g, "T");
    sftext = sftext.replace(/ඹ/g, "U");
    sftext = sftext.replace(/ඪ/g, "V");
    sftext = sftext.replace(/උ/g, "W");
    sftext = sftext.replace(/ශ/g, "Y");
    sftext = sftext.replace(/ඤ/g, "[");
    sftext = sftext.replace(/ඉ/g, "b");
    sftext = sftext.replace(/ජ/g, "c");
    sftext = sftext.replace(/ට/g, "g");
    sftext = sftext.replace(/ය/g, "h");
    sftext = sftext.replace(/ස/g, "i");
    sftext = sftext.replace(/ව/g, "j");
    sftext = sftext.replace(/න/g, "k");
    sftext = sftext.replace(/ක/g, "l");
    sftext = sftext.replace(/ප/g, "m");
    sftext = sftext.replace(/බ/g, "n");
    sftext = sftext.replace(/ද/g, "o");
    sftext = sftext.replace(/ච/g, "p");
    sftext = sftext.replace(/ර/g, "r");
    sftext = sftext.replace(/එ/g, "t");
    sftext = sftext.replace(/ම/g, "u");
    sftext = sftext.replace(/ඩ/g, "v");
    sftext = sftext.replace(/අ/g, "w");
    sftext = sftext.replace(/හ/g, "y");
    sftext = sftext.replace(/ඥ/g, "{");
    sftext = sftext.replace(/ඳ/g, "|");
    sftext = sftext.replace(/ක්‍ෂ/g, "Ì");
    sftext = sftext.replace(/ැ/g, "e");
    sftext = sftext.replace(/ෑ/g, "E");
    sftext = sftext.replace(/ෙ/g, "f");
    sftext = sftext.replace(/ු/g, "q");
    sftext = sftext.replace(/ි/g, "s");
    sftext = sftext.replace(/ූ/g, "Q");
    sftext = sftext.replace(/ී/g, "S");
    sftext = sftext.replace(/ෘ/g, "D");
    sftext = sftext.replace(/ෲ/g, "DD");
    sftext = sftext.replace(/ෟ/g, "!");
    sftext = sftext.replace(/ා/g, "d");
    sftext = sftext.replace(/්/g, "a");
    sftext = sftext.replace(/￦/g, '"');
    sftext = sftext.replace(/￫/g, "^");
    sftext = sftext.replace(/￩/g, "&");
    sftext = sftext.replace(/ￔ/g, ")");
    sftext = sftext.replace(/ￓ/g, "@");
    sftext = sftext.replace(/ￒ/g, "`");
    sftext = sftext.replace(/ￏ/g, "}");
    sftext = sftext.replace(/ￎ/g, "~");
    sftext = sftext.replace(/\ￍ/g, "¤");
    sftext = sftext.replace(/\ￌ/g, "•");
    sftext = sftext.replace(/\ￊ/g, "›");
    sftext = sftext.replace(/\ﾶ/g, "∙");
    sftext = sftext.replace(/ￕ/g, "]");

    return sftext;
  };

  const convertSinhalaInLine = (line) => {
    const sinhalaRegex = /[\u0D80-\u0DFF]+/g;
    return line.replace(sinhalaRegex, (match) => sinhalaToUnicode(match));
  };

  const handleSRTConversion = (content) => {
    const lines = content.split("\n");
    const convertedLines = lines.map((line) => {
      const timecodeRegex =
        /^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/;
      const indexNumberRegex = /^\d+$/;

      if (timecodeRegex.test(line) || indexNumberRegex.test(line)) {
        return line;
      }

      return convertSinhalaInLine(line);
    });

    return convertedLines.join("\n");
  };

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
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Sinhala Subtitle Converter
          </Typography>
          <IconButton onClick={handleThemeToggle} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="sm"
        style={{ marginTop: "20px", marginBottom: "80px" }}
      >
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
      </Container>
      <Footer />
    </ThemeProvider>
  );
}

const Footer = () => (
  <Paper
    style={{
      padding: "10px 0",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: "center",
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
          window.open("https://www.youtube.com/yourchannel", "_blank")
        }
      >
        <YouTubeIcon />
      </IconButton>
      <IconButton
        color="inherit"
        onClick={() =>
          window.open("https://www.tiktok.com/@yourusername", "_blank")
        }
      >
        <MusicNoteIcon />
      </IconButton>
    </Box>
  </Paper>
);

export default App;
