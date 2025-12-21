import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Auth views
import Login from './views/Auth/Login';
import Signup from './views/Auth/Signup';

// Student views
import StudentLayout from './layout/StudentLayout';
import StudentDashboard from './views/Student/StudentDashboard';
import Goals from './views/Student/Goals';
import Projects from './views/Student/Projects';
import Reflections from './views/Student/Reflections';
import Badges from './views/Student/Badges';

// Educator views
import EducatorLayout from './layout/EducatorLayout';
import EducatorDashboard from './views/Educator/EducatorDashboard';
import StudentList from './views/Educator/StudentList';
import Reports from './views/Educator/Reports';

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

function AppRoutes() {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student routes - uses StudentLayout as wrapper */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="projects" element={<Projects />} />
        <Route path="reflections" element={<Reflections />} />
        <Route path="badges" element={<Badges />} />
      </Route>

      {/* Educator routes - uses EducatorLayout as wrapper */}
      <Route
        path="/educator"
        element={
          <ProtectedRoute requiredRole="educator">
            <EducatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EducatorDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Root redirect based on role */}
      <Route
        path="/"
        element={
          role === 'student' ? (
            <Navigate to="/student" replace />
          ) : role === 'educator' ? (
            <Navigate to="/educator" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - redirect to root which handles auth */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
