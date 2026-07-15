import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#FF6F00', light: '#FFB74D', dark: '#E65100' },
    secondary: { main: '#FF8F00', light: '#FFD54F', dark: '#FF6F00' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
    info: { main: '#0288D1' },
    background: { default: '#FFF8E7', paper: '#FFFFFF' },
    text: { primary: '#3E2723', secondary: '#5D4037' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 12 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.05)' },
      },
    },
  },
});

export default theme;
