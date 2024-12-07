import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Home from './pages/Home';
import MyStreaks from './pages/MyStreaks';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import EventDetails from './pages/EventDetails';

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
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/mystreaks" element={<MyStreaks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
        </Routes>
      </>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
