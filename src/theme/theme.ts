import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E8521A',
      dark: '#B83D0F',
      light: '#FDF0EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1A1510',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#27500A',
      light: '#EAF3DE',
    },
    warning: {
      main: '#633806',
      light: '#FAEEDA',
    },
    background: {
      default: '#F5F2EF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1510',
      secondary: '#6B5E54',
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    body1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 400 },
    body2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 400 },
    button: { fontFamily: '"DM Sans", sans-serif', fontWeight: 500, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          padding: '10px 20px',
        },
        containedPrimary: {
          background: '#E8521A',
          '&:hover': {
            background: '#B83D0F',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: 'rgba(26,21,16,0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(26,21,16,0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E8521A',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(26,21,16,0.08)',
          border: '1px solid rgba(26,21,16,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(232,82,26,0.15)',
        },
        bar: {
          backgroundColor: '#E8521A',
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
