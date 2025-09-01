
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const StudentDashboard = () => {
  return (
    <Card className="m-4 shadow-lg bg-white">
      <CardContent>
        <Typography variant="h5" component="div">
          Student Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete tasks, earn Curio Coins, and explore STEAM quests.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StudentDashboard;
