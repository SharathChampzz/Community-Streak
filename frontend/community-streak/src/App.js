import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Home from './pages/Home';
import MyStreaks from './pages/MyStreaks';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import EventDetails from './pages/EventDetails';
import RenderMotivationVideos from './pages/RenderMotivationVideos';

function App() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const AppContent = () => {
    const location = useLocation();

    // Hide header for login and register pages
    const hideHeader = ['/login', '/register'].includes(location.pathname);

    return (
      <>
        {!hideHeader && <Header toggleTheme={toggleTheme} />}
        <div style={{ paddingTop: '10px' }}> {/* Adjust this value based on header height */}
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/mystreaks" element={<MyStreaks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/videos" element={<RenderMotivationVideos />} />
          </Routes>
        </div>
      </>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          // Global scrollbar styles
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
          '*::-webkit-scrollbar-corner': {
            background: '#f1f1f1',
          },
          // Sticky Header styling
          'header': {
            position: 'sticky',
            top: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,  // Ensure it stays on top
          },
        }}
      />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
