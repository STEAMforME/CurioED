import { ReactNode, useState } from 'react';
import { Box, Container, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Badge, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, useTheme, useMediaQuery, Paper } from '@mui/material';
import { Menu as MenuIcon, Notifications, AccountCircle, Dashboard as DashboardIcon, School, EmojiEvents, Assignment, People, CalendarToday, Chat, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DRAWER_WIDTH = 280;

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Courses', icon: <School />, path: '/courses' },
    { text: 'Quests & Badges', icon: <EmojiEvents />, path: '/quests' },
    { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
    { text: 'Mentors', icon: <People />, path: '/mentors' },
    { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'Messages', icon: <Chat />, path: '/messages' },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1, py: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">CRAFT</Typography>
        <Typography variant="h5" fontWeight="300" sx={{ ml: 0.5 }}>the Future</Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Paper sx={{ p: 2, backgroundColor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
          <Typography variant="caption">Powered by</Typography>
          <Typography variant="body2" fontWeight="bold">STEAM for ME NJ</Typography>
          <Typography variant="caption">Newark, New Jersey</Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{title || 'Dashboard'}</Typography>
          <IconButton color="inherit"><Badge badgeContent={4} color="error"><Notifications /></Badge></IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>{user?.email?.[0]?.toUpperCase() || 'U'}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>{drawer}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }} open>{drawer}</Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
