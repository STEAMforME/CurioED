import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import ThoughtBubbleIcon from '@mui/icons-material/LightbulbOutlined';
import BadgeIcon from '@mui/icons-material/Stars';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface DashboardStats {
  totalGoals: number;
  completedGoals: number;
  totalProjects: number;
  totalReflections: number;
  totalBadges: number;
  recentActivity: Activity[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalProjects: 0,
    totalReflections: 0,
    totalBadges: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch goals
      const { data: goals } = await supabase
        .from('curioed_goals')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch projects
      const { data: projects } = await supabase
        .from('curioed_projects')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch reflections
      const { data: reflections } = await supabase
        .from('curioed_reflections')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch badges
      const { data: badges } = await supabase
        .from('curioed_student_badges')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('curioed_activity_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('occurred_at', { ascending: false })
        .limit(5);

      setStats({
        totalGoals: goals?.length || 0,
        completedGoals: goals?.filter((g) => g.completed).length || 0,
        totalProjects: projects?.length || 0,
        totalReflections: reflections?.length || 0,
        totalBadges: badges?.length || 0,
        recentActivity:
          activity?.map((a) => ({
            id: a.id,
            type: a.activity_type,
            description: getActivityDescription(a.activity_type),
            date: new Date(a.occurred_at).toLocaleDateString(),
          })) || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      goal_created: 'Created a new goal',
      reflection_submitted: 'Submitted a reflection',
      project_created: 'Started a new project',
      badge_earned: 'Earned a new badge',
    };
    return descriptions[type] || type;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal_created':
        return <EmojiEventsIcon />;
      case 'reflection_submitted':
        return <ThoughtBubbleIcon />;
      case 'project_created':
        return <FolderIcon />;
      case 'badge_earned':
        return <BadgeIcon />;
      default:
        return <TrendingUpIcon />;
    }
  };

  const goalCompletionRate =
    stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {profile?.first_name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your learning progress at a glance
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <EmojiEventsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalGoals}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Goals
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={goalCompletionRate}
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {stats.completedGoals} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <FolderIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalProjects}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ThoughtBubbleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalReflections}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reflections
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <BadgeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalBadges}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Badges
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          {stats.recentActivity.length > 0 ? (
            <List>
              {stats.recentActivity.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>{getActivityIcon(activity.type)}</ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={activity.date}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No activity yet. Start by creating your first goal!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          label="Create Goal"
          icon={<EmojiEventsIcon />}
          clickable
          color="primary"
          onClick={() => (window.location.href = '/student/goals')}
        />
        <Chip
          label="Add Project"
          icon={<FolderIcon />}
          clickable
          color="success"
          onClick={() => (window.location.href = '/student/projects')}
        />
        <Chip
          label="Write Reflection"
          icon={<ThoughtBubbleIcon />}
          clickable
          color="info"
          onClick={() => (window.location.href = '/student/reflections')}
        />
      </Box>
    </Box>
  );
}
