
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Sidebar = () => {
  return (
    <Drawer variant="permanent" anchor="left" className="w-64">
      <List>
        <ListItem button>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><MenuBookIcon /></ListItemIcon>
          <ListItemText primary="Curriculum" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
          <ListItemText primary="Gamification" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
