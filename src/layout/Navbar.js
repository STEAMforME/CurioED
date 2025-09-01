
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = () => {
  return (
    <AppBar position="static" className="bg-blue-600">
      <Toolbar>
        <SchoolIcon className="mr-2" />
        <Typography variant="h6" component="div">
          CurioED Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
