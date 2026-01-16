import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Fade,
  Grow,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface DashboardStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  avgProgress: number;
  totalBadges: number;
  recentBadges: number;
  totalReflections: number;
  weekStreak: number;
}

interface RecentActivity {
  id: string;
  type: 'goal' | 'badge' | 'reflection';
  title: string;
  timestamp: string;
  icon: any;
  color: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    avgProgress: 0,
    totalBadges: 0,
    recentBadges: 0,
    totalReflections: 0,
    weekStreak: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('curioed_goals')
        .select('*')
        .eq('user_id', user?.id);

      if (goalsError) throw goalsError;

      const activeGoals = goals?.filter((g) => !g.completed) || [];
      const completedGoals = goals?.filter((g) => g.completed) || [];
      const avgProgress =
        activeGoals.length > 0
          ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
          : 0;

      // Fetch badges
      const { data: badges, error: badgesError } = await supabase
        .from('curioed_student_badges')
        .select('*')
        .eq('user_id', user?.id);

      if (badgesError) throw badgesError;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentBadges = badges?.filter(
        (b) => new Date(b.earned_at) > oneWeekAgo
      ).length || 0;

      // Fetch reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('curioed_reflections')
        .select('*')
        .eq('user_id', user?.id);

      if (reflectionsError) throw reflectionsError;

      // Calculate week streak (simplified)
      const weekStreak = reflections?.length > 0 ? Math.min(reflections.length, 7) : 0;

      setStats({
        totalGoals: goals?.length || 0,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        avgProgress,
        totalBadges: badges?.length || 0,
        recentBadges,
        totalReflections: reflections?.length || 0,
        weekStreak,
      });

      // Build recent activities
      const activities: RecentActivity[] = [];

      // Add recent goals
      activeGoals.slice(0, 2).forEach((goal) => {
        activities.push({
          id: goal.id,
          type: 'goal',
          title: goal.title,
          timestamp: goal.created_at,
          icon: AssignmentIcon,
          color: '#6366F1',
        });
      });

      // Add recent badges
      const recentBadgesList = badges
        ?.sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
        .slice(0, 2) || [];

      recentBadgesList.forEach((badge) => {
        activities.push({
          id: badge.id,
          type: 'badge',
          title: 'Earned a new badge!',
          timestamp: badge.earned_at,
          icon: EmojiEventsIcon,
          color: '#F59E0B',
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            {greeting}, Scholar! 🎓
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Let's power up your learning journey today.
          </Typography>
        </Box>
      </Fade>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Active Goals
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stats.activeGoals}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AssignmentIcon />
                  </Avatar>
                </Box>
                {stats.avgProgress > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {stats.avgProgress}% average progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats.avgProgress}
                      sx={{
                        mt: 0.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={700}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Badges Earned
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stats.totalBadges}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <EmojiEventsIcon />
                  </Avatar>
                </Box>
                {stats.recentBadges > 0 && (
                  <Chip
                    label={`+${stats.recentBadges} this week`}
                    size="small"
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Completed Goals
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stats.completedGoals}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
                {stats.totalGoals > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.9, mt: 2, display: 'block' }}>
                    {Math.round((stats.completedGoals / stats.totalGoals) * 100)}% completion rate
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={900}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Learning Streak
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stats.weekStreak}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9, mt: 2, display: 'block' }}>
                  {stats.totalReflections} total reflections
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Fade in timeout={1000}>
        <Grid container spacing={3}>
          {/* Today's Focus */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderLeft: '4px solid #6366F1',
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: '#6366F1' }} />
                  <Typography variant="h6">Today's Focus</Typography>
                </Box>
                {stats.activeGoals > 0 ? (
                  <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      You have <strong>{stats.activeGoals} active goals</strong> to work on.
                      Keep the momentum going!
                    </Typography>
                    <Button
                      component={Link}
                      to="/student/goals"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #6366F1 30%, #EC4899 90%)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      View My Goals
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Start your learning journey by creating your first goal!
                    </Typography>
                    <Button
                      component={Link}
                      to="/student/goals"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #6366F1 30%, #EC4899 90%)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      Create Your First Goal
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Nova Byte Tip */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderLeft: '4px solid #EC4899',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoAwesomeIcon sx={{ mr: 1, color: '#EC4899' }} />
                  <Typography variant="h6">Nova Byte Tip</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  "Stay curious! Ask why, not just how. Deep questions lead to deeper learning."
                </Typography>
                <Button
                  component={Link}
                  to="/student/assistant"
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: '#EC4899', color: '#EC4899' }}
                >
                  Chat with Nova
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <Fade in timeout={1100}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            <Grid container spacing={2}>
              {recentActivities.map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <Grid item xs={12} sm={6} key={activity.id}>
                    <Grow in timeout={1200 + index * 100}>
                      <Card
                        sx={{
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'translateX(8px)', boxShadow: 4 },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: activity.color }}>
                              <ActivityIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {activity.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
