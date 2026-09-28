import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    layout: {
      pageMaxWidth: string;
      pageTopInset: string;
      appBarHeight: string;
      radiusMd: string;
      radiusLg: string;
    };
  }
  interface ThemeOptions {
    layout?: Theme['layout'];
  }
}

export const muiTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: {
      default: '#101820',
      paper: '#18242e',
    },
    primary: {
      main: '#e8505b',
    },
    secondary: {
      main: '#4fc3f7',
    },
    text: {
      primary: '#eef2f5',
      secondary: 'rgba(238, 242, 245, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
  layout: {
    pageMaxWidth: '64rem',
    pageTopInset: '24px',
    appBarHeight: '64px',
    radiusMd: '0.5rem',
    radiusLg: '1rem',
  },
});
