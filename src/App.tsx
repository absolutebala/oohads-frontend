import React from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { Login } from './Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5733', // Replace with AdRide primary color
    },
    secondary: {
      main: '#C70039', // Replace with AdRide secondary color
    },
  },
  typography: {
    h1: {
      fontFamily: 'Syne, sans-serif',
    },
    h2: {
      fontFamily: 'Syne, sans-serif',
    },
    body1: {
      fontFamily: 'DM Sans, sans-serif',
    },
    body2: {
      fontFamily: 'DM Sans, sans-serif',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login />
    </ThemeProvider>
  );
};

export default App;