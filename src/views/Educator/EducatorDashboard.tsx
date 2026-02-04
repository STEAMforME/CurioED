import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import StarsIcon from '@mui/icons-material/Stars';
import PersonIcon from '@mui/icons-material/Person';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalGoals: number;
  totalReflections: number;
  atRiskStudents: Student[];
  recentActivity: Activity[];
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
  last_active?: string;
  engagement_score?: number;
}

interface Activity {
  id: string;
  student_name: string;
  type: string;
  description: string;
  date: string;
}

export default function EducatorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalGoals: 0,
    totalReflections: 0,
    atRiskStudents: [],
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
      // Fetch all students assigned to this educator
      const { data: assignments } = await supabase
        .from('curioed_assignments')
        .select('student_id')
        .eq('educator_id', user?.id);

      const studentIds = assignments?.map((a) => a.student_id) || [];

      if (studentIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch student profiles
      const { data: students } = await supabase
        .from('curioed_students')
        .select('*')
        .in('user_id', studentIds);

      // Fetch goals for these students
      const { data: goals } = await supabase
        .from('curioed_goals')
        .select('*')
        .in('user_id', studentIds);

      // Fetch reflections
      const { data: reflections } = await supabase
        .from('curioed_reflections')
        .select('*')
        .in('user_id', studentIds);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('curioed_activity_log')
        .select('*, curioed_students!inner(first_name, last_name)')
        .in('user_id', studentIds)
        .order('occurred_at', { ascending: false })
        .limit(10);

      // Calculate engagement scores
      const studentsWithEngagement = students?.map((student) => {
        const studentGoals = goals?.filter((g) => g.user_id === student.user_id) || [];
        const studentReflections =
          reflections?.filter((r) => r.user_id === student.user_id) || [];
        const studentActivity =
          activity?.filter((a) => a.user_id === student.user_id) || [];

        // Simple engagement score based on recent activity
        const recentActivityCount = studentActivity.filter((a) => {
          const activityDate = new Date(a.occurred_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return activityDate > weekAgo;
        }).length;

        const engagementScore =
          Math.min(100, recentActivityCount * 20 + studentGoals.length * 10);

        return {
          ...student,
          engagement_score: engagementScore,
          last_active:
            studentActivity[0]?.occurred_at || student.created_at,
        };
      }) || [];

      // Identify at-risk students (engagement < 40%)
      const atRisk = studentsWithEngagement.filter(
        (s) => (s.engagement_score || 0) < 40
      );

      // Count active students (activity in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeCount = studentsWithEngagement.filter((s) => {
        const lastActive = new Date(s.last_active || 0);
        return lastActive > weekAgo;
      }).length;

      setStats({
        totalStudents: students?.length || 0,
        activeStudents: activeCount,
        totalGoals: goals?.length || 0,
        totalReflections: reflections?.length || 0,
        atRiskStudents: atRisk.slice(0, 5),
        recentActivity:
          activity?.slice(0, 5).map((a: any) => ({
            id: a.id,
            student_name: `${a.curioed_students.first_name} ${a.curioed_students.last_name}`,
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
          Here's your classroom overview
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.activeStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active This Week
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
                  <StarsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalGoals}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Goals
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
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.atRiskStudents.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Need Attention
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* At-Risk Students */}
        {stats.atRiskStudents.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students Needing Attention
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  These students have low engagement scores. Consider reaching out!
                </Alert>
                <List>
                  {stats.atRiskStudents.map((student) => (
                    <ListItem key={student.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.first_name} ${student.last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Grade {student.grade}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.engagement_score || 0}
                              sx={{ mt: 1 }}
                            />
                            <Typography variant="caption">
                              Engagement: {student.engagement_score}%
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {stats.recentActivity.length > 0 ? (
                <List>
                  {stats.recentActivity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.student_name}
                        secondary={
                          <>
                            {activity.description}
                            <br />
                            <Typography variant="caption">{activity.date}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity from students
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Empty State */}
      {stats.totalStudents === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No students assigned yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students will appear here once they're assigned to your class
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
