import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export default function SuperintendentDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/admin/kpis').then(res => setKpis(res));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Superintendent Dashboard - {user?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        District-Wide Metrics
      </Typography>
      
      {kpis && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Total Learners</Typography>
              <Typography variant="h3">{kpis.totalLearners}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Active Enrollments</Typography>
              <Typography variant="h3">{kpis.activeEnrollments}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Avg XP Per Learner</Typography>
              <Typography variant="h3">{kpis.avgXpPerLearner}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Mentor Sessions</Typography>
              <Typography variant="h3">{kpis.mentorSessionsThisMonth}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
