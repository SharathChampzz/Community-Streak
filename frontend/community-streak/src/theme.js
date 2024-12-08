import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ab47bc', // Updated to a nice purple shade
    },
    highlight: {
      main: '#d0e8ff', // Light Blue highlight for the user in light mode
    },
    danger: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#5f6368',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#7e57c2', // Updated to a rich purple shade for dark mode
    },
    highlight: {
      main: '#3a3b3c', // Soft Cyan highlight for the user in dark mode
    },
    danger: {
      main: '#f44336',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a5a5a5',
    },
  },
});

export { lightTheme, darkTheme };
