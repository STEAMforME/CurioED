import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch KPIs
    apiClient.get('/admin/kpis').then(res => setKpis(res));
    // Fetch all users
    apiClient.get('/admin/users').then(res => setUsers(res));
  }, []);

  const handleImpersonate = async (userId: string) => {
    try {
      const res = await apiClient.post(`/admin/impersonate/${userId}`);
      localStorage.setItem('curioed_token', res.accessToken);
      window.location.reload();
    } catch (err) {
      console.error('Impersonation failed:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard - {user?.name}
      </Typography>
      
      {kpis && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Total Learners</Typography>
              <Typography variant="h3">{kpis.totalLearners}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Active Enrollments</Typography>
              <Typography variant="h3">{kpis.activeEnrollments}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Completion Rate</Typography>
              <Typography variant="h3">{kpis.completionRate}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <Grid container spacing={2}>
        {users.map((u) => (
          <Grid item xs={12} md={6} key={u.id}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{u.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {u.email} - {u.role}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleImpersonate(u.id)}
              >
                Impersonate
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
