
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const EducatorDashboard = () => {
  return (
    <Card className="m-4 shadow-lg bg-white">
      <CardContent>
        <Typography variant="h5" component="div">
          Educator Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create curriculum templates, align standards, and track student progress.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EducatorDashboard;
