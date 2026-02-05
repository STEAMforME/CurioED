import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './router/AppRoutes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af',
      light: '#3b82f6',
      dark: '#1e3a8a',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#16a34a',
    },
    info: {
      main: '#0284c7',
    },
    warning: {
      main: '#ea580c',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
