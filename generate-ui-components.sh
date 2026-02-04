#!/bin/bash

echo "🚀 Generating commercial-grade UI components for CRAFT the Future..."
echo "📍 Newark STEAM Education Platform"
echo ""

# Create directories
echo "📁 Creating component structure..."
mkdir -p src/components/{Dashboard,Mentoring,Gamification,Courses,Calendar,Chat,Search,Notifications}

# ============================================================================
# DASHBOARD LAYOUT
# ============================================================================
echo "📊 Creating Dashboard Layout..."

cat > src/components/Dashboard/DashboardLayout.tsx << 'DASHBOARDEOF'
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
DASHBOARDEOF

# ============================================================================
# MENTORING COMPONENTS
# ============================================================================
echo "👥 Creating Mentoring components..."

cat > src/components/Mentoring/MentorCard.tsx << 'MENTOREOF'
import { Card, CardContent, CardActions, Avatar, Typography, Chip, Button, Box, Rating, Stack } from '@mui/material';
import { VideoCall, CalendarToday, School } from '@mui/icons-material';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    avatar?: string;
    expertise: string[];
    rating: number;
    sessionsCompleted: number;
    bio: string;
    available: boolean;
  };
  onBookSession: (mentorId: string) => void;
}

export default function MentorCard({ mentor, onBookSession }: MentorCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={mentor.avatar} sx={{ width: 64, height: 64, mr: 2 }}>{mentor.name[0]}</Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6">{mentor.name}</Typography>
            <Rating value={mentor.rating} readOnly size="small" />
          </Box>
          {mentor.available && <Chip label="Available" color="success" size="small" />}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>{mentor.bio}</Typography>
        <Stack direction="row" spacing={1}>
          {mentor.expertise.map((skill) => <Chip key={skill} label={skill} size="small" icon={<School />} />)}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<CalendarToday />} onClick={() => onBookSession(mentor.id)}>Book</Button>
      </CardActions>
    </Card>
  );
}
MENTOREOF

# ============================================================================
# GAMIFICATION COMPONENTS
# ============================================================================
echo "🎮 Creating Gamification components..."

cat > src/components/Gamification/QuestCard.tsx << 'QUESTEOF'
import { Card, CardContent, Typography, LinearProgress, Box, Chip, Button, Stack } from '@mui/material';
import { EmojiEvents, Star } from '@mui/icons-material';

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    progress: number;
    xpReward: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    completed: boolean;
  };
  onStart: (questId: string) => void;
}

export default function QuestCard({ quest, onStart }: QuestCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{quest.title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>{quest.description}</Typography>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip label={quest.difficulty} size="small" />
          <Chip icon={<Star />} label={`${quest.xpReward} XP`} size="small" />
        </Stack>
        <Box mb={2}>
          <Typography variant="caption">Progress: {quest.progress}%</Typography>
          <LinearProgress variant="determinate" value={quest.progress} />
        </Box>
        {!quest.completed && <Button variant="contained" fullWidth onClick={() => onStart(quest.id)}>Start Quest</Button>}
      </CardContent>
    </Card>
  );
}
QUESTEOF

echo ""
echo "✅ Commercial-grade UI components generated successfully!"
echo ""
echo "📦 Next steps:"
echo "1. Run: chmod +x generate-ui-components.sh"
echo "2. Run: npm install (if needed)"
echo "3. Run: npm run dev"
echo ""
echo "🎉 Your CRAFT the Future platform is ready!"
