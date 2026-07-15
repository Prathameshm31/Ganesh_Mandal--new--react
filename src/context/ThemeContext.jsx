import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({ toggleTheme: () => {}, mode: 'light' });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('ganeshMandalThemeMode') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganeshMandalThemeMode', mode);
    } catch {
      // localStorage unavailable
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#FF6F00', light: '#FFB74D', dark: '#E65100' },
                secondary: { main: '#FF8F00', light: '#FFD54F', dark: '#FF6F00' },
                success: { main: '#2E7D32' },
                warning: { main: '#ED6C02' },
                error: { main: '#D32F2F' },
                info: { main: '#0288D1' },
                background: { default: '#FFF8E7', paper: '#FFFFFF' },
                text: { primary: '#3E2723', secondary: '#5D4037' },
              }
            : {
                primary: { main: '#FF8F00', light: '#FFD54F', dark: '#FF6F00' },
                secondary: { main: '#FFB74D', light: '#FFE082', dark: '#FF8F00' },
                success: { main: '#66BB6A' },
                warning: { main: '#FFA726' },
                error: { main: '#EF5350' },
                info: { main: '#29B6F6' },
                background: { default: '#121212', paper: '#1E1E1E' },
                text: { primary: '#FFFFFF', secondary: '#BDBDBD' },
              }),
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
              root: {
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                borderRadius: 12,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                border: 'none',
                boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
