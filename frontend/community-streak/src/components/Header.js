import React from 'react';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, IconButton, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const username = JSON.parse(localStorage.getItem('user'))?.username || 'User'; // Fetch username from localStorage
  const navigate = useNavigate();

  // Open dropdown
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close dropdown
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Logout logic
  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage
    navigate('/login'); // Redirect to login
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          onClick={() => navigate('/')} 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
        >
          Community Streak
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/mystreaks')}>My Streaks 🔥</Button>
          <Button color="inherit" onClick={() => navigate('/')}>Explore Events 😎</Button>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>Hello, {username}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
