import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ToastAlert from "./ToastAlert";
import { useNavigate } from "react-router-dom";
import { getWebSocketUrl } from '../services/utils'; // Import from the correct path

function Header({ toggleTheme, darkMode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const username = JSON.parse(localStorage.getItem("user"))?.username || "User";
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, text: '', severity: 'info' });

  // Load notifications from local storage
  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications.slice(0, 5)); // Limit to 5 notifications
  }, []);

  // WebSocket connection to receive real-time notifications
  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const newNotification = event.data;

      setToast({ open: true, text: newNotification, severity: 'success' });
      setNotifications((prev) => {
        const updatedNotifications = [newNotification, ...prev].slice(0, 5); // Keep only 5 notifications
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
    <>
      <AppBar position="sticky" elevation={0} sx={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", marginBottom: 2 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate("/")}
            sx={{ flexGrow: 1, cursor: "pointer", fontWeight: 600 }}
          >
            Community Streak 🚀
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
              sx={{
                maxWidth: "500px", // Fixed width for consistency
                minWidth: "200px", // Ensure it has a minimum width
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem key={index} sx={{ wordWrap: "break-word", whiteSpace: "normal", minWidth: "300px" }}>
                    {notification}
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No notifications</MenuItem>
              )}
            </Menu>

            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 2 }}>
              <Avatar
                src={`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${username}`}
                alt={username}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>Hello, {username}</MenuItem>
              <MenuItem onClick={() => { navigate("/"); handleMenuClose(); }}>Home 🏠</MenuItem>
              <MenuItem onClick={() => { navigate("/mystreaks"); handleMenuClose(); }}>My Streaks 🔥</MenuItem>
              <MenuItem onClick={() => { navigate("/videos"); handleMenuClose(); }}>Motivation Videos 🎥</MenuItem>
              <MenuItem onClick={handleLogout}>Logout 🚪</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <ToastAlert
        open={toast.open}
        onClose={() => {
          setToast({ ...toast, open: false });
        }}
        text={toast.text}
        severity={toast.severity}
      />
    </>
  );
}

export default Header;
