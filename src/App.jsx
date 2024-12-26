// src/App.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { Brightness4, Brightness7, Menu as MenuIcon } from "@mui/icons-material";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VideoToSrt from "./pages/VideoToSrt";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const commonTabStyles = {
    textTransform: 'none',
    minWidth: 120,
    fontWeight: 400,
    marginRight: '8px',
    borderRadius: '8px',
    transition: 'all 0.3s',
    '&.Mui-selected': {
      fontWeight: 500,
    },
  };

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
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            ...commonTabStyles,
            color: '#fff',
            opacity: 0.7,
            '&.Mui-selected': {
              ...commonTabStyles['&.Mui-selected'],
              color: '#fff',
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            display: 'none',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: 'rgba(144, 202, 249, 0.12)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
          },
        },
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
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minWidth: 120,
            fontWeight: 400,
            marginRight: '8px',
            transition: 'all 0.3s',
            opacity: 0.7,
            borderRadius: '8px',
            '&.Mui-selected': {
              fontWeight: 500,
              opacity: 1,
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
            },
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(25, 118, 210, 0.05)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            display: 'none',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  });

  const handleThemeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: "Unicode Converter (SRT)", path: "/" },
    { label: "Video to SRT", path: "/video-to-srt" },
  ];

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleMenuItemClick(item.path)}
          >
            <ListItemText 
              primary={item.label} 
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AppBar 
        position="static" 
        elevation={0}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: isMobile ? 1 : 0, 
              marginRight: isMobile ? 0 : 2,
              fontSize: isMobile ? '1rem' : '1.25rem',
              fontWeight: 500,
            }}
          >
            Sinhala Subtitle Converter
          </Typography>
          
          {!isMobile && (
            <Tabs
              value={location.pathname}
              sx={{ 
                flexGrow: 1,
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
              }}
              textColor="inherit"
            >
              {menuItems.map((item) => (
                <Tab
                  key={item.path}
                  label={item.label}
                  value={item.path}
                  component={Link}
                  to={item.path}
                />
              ))}
            </Tabs>
          )}
          
          <IconButton 
            onClick={handleThemeToggle} 
            color="inherit"
            sx={{
              borderRadius: '8px',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Brightness7 />
          </IconButton>
        </Toolbar>
      </AppBar>
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video-to-srt" element={<VideoToSrt />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;