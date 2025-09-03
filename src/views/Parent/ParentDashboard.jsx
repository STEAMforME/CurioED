import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const ParentDashboard = () => {
  return (
    <Card className="m-4 shadow-lg bg-white">
      <CardContent>
        <Typography variant="h5" component="div">
          Parent Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View learning schedules, track student progress, and communicate with educators.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ParentDashboard;
