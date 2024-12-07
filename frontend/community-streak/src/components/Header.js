import React from 'react';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, IconButton, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate } from 'react-router-dom';

function Header({ toggleTheme, darkMode }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const username = JSON.parse(localStorage.getItem('user'))?.username || 'User';
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', marginBottom: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          onClick={() => navigate('/')}
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}
        >
          Community Streak 🎉
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home 🏠
          </Button>
          <Button color="inherit" onClick={() => navigate('/mystreaks')}>
            My Streaks 🔥
          </Button>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 2 }}
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
