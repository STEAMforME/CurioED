import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Container,
} from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, role } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const { error } = await signIn(email, password);

    if (error) {
      throw new Error(error.message);
    }

    // Navigate based on role
    setTimeout(() => {
      if (role) {
        navigate(`/${role}`);
      } else {
        setLoading(false);
      }
    }, 500);
  } catch (err: any) {
    setError(err.message || 'Failed to sign in');
    setLoading(false);
  }
};


  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to CurioED
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue your learning journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
