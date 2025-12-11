import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppRoutes() {
  const { role, loading } = useAuth();

  if (loading) {
    return null; // ProtectedRoute handles loading state
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <Routes>
                <Route index element={<StudentDashboard />} />
                <Route path="goals" element={<Goals />} />
                <Route path="projects" element={<Projects />} />
                <Route path="reflections" element={<Reflections />} />
                <Route path="badges" element={<Badges />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* Educator routes */}
      <Route
        path="/educator/*"
        element={
          <ProtectedRoute requiredRole="educator">
            <EducatorLayout>
              <Routes>
                <Route index element={<EducatorDashboard />} />
                <Route path="students" element={<StudentList />} />
                <Route path="reports" element={<Reports />} />
              </Routes>
            </EducatorLayout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect based on role */}
      <Route
        path="/"
        element={
          role ? <Navigate to={`/${role}`} replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
