import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f7bdca',
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
      main: '#8b8b8b',
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
