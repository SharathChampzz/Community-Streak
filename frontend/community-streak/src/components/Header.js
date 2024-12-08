import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Badge,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ToastAlert from "./ToastAlert";
import { useNavigate } from "react-router-dom";

function Header({ toggleTheme, darkMode }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const username = JSON.parse(localStorage.getItem("user"))?.username || "User";
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, text: '', severity: 'info' });

  // Load notifications from local storage
  React.useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);
  }, []);

  // WebSocket connection
  React.useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/motivation");

    ws.onmessage = (event) => {
      const newNotification = event.data;

      setToast({ open: true, text: newNotification, severity: 'success' });
      // Update notifications and local storage
      setNotifications((prev) => {
        
        const updatedNotifications = [newNotification, ...prev].slice(0, 10);
        localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => ws.close(); // Cleanup on unmount
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", marginBottom: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          onClick={() => navigate("/")}
          sx={{ flexGrow: 1, cursor: "pointer", fontWeight: 600 }}
        >
          Community Streak 🎉
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit" onClick={handleNotificationOpen} sx={{ ml: 2 }}>
            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            sx={{ maxWidth: "700px" }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <MenuItem key={index}>{notification}</MenuItem>
              ))
            ) : (
              <MenuItem>No notifications</MenuItem>
            )}
          </Menu>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home 🏠
          </Button>
          <Button color="inherit" onClick={() => navigate("/mystreaks")}>
            My Streaks 🔥
          </Button>
          <Button color="inherit" onClick={() => navigate("/videos")}>
            Motivation 📺
          </Button>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>Hello, {username}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <ToastAlert
        open={toast.open}
        onClose={() => {
          setToast({ ...toast, open: false });
        }}
        text={toast.text}
        severity={toast.severity}
      />
    </AppBar>
    
  );
}

export default Header;
