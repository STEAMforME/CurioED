import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function DashboardView() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Route based on user role
      switch (user.role) {
        case 'learner':
          navigate('/student');
          break;
        case 'parent':
          navigate('/parent');
          break;
        case 'mentor':
          navigate('/mentor');
          break;
        case 'instructor':
          navigate('/instructor');
          break;
        case 'principal':
          navigate('/principal');
          break;
        case 'superintendent':
          navigate('/superintendent');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } else if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}
