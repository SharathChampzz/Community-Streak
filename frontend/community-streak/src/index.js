import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // If you have global styles.
import { CssBaseline } from '@mui/material';

// Create root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
