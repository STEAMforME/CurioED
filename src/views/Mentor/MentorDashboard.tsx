import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/mentor/sessions').then(res => setSessions(res));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mentor Dashboard - {user?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Mentorship Sessions
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Upcoming Sessions</Typography>
            {sessions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No sessions scheduled yet
              </Typography>
            ) : (
              sessions.map((session) => (
                <Box key={session.id} sx={{ mt: 2 }}>
                  <Typography>{session.topic || 'General Mentorship'}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
