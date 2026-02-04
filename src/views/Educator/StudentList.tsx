import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';

interface StudentData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  grade: number;
  email?: string;
  goals_count: number;
  reflections_count: number;
  projects_count: number;
  badges_count: number;
  engagement_score: number;
  last_active: string;
}

export default function StudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.first_name.toLowerCase().includes(query) ||
            s.last_name.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      // Get assigned students
      const { data: assignments } = await supabase
        .from('curioed_assignments')
        .select('student_id')
        .eq('educator_id', user?.id);

      const studentIds = assignments?.map((a) => a.student_id) || [];

      if (studentIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch student profiles with auth data
      const { data: students } = await supabase
        .from('curioed_students')
        .select('*')
        .in('user_id', studentIds);

      // Fetch counts for each student
      const studentsWithStats = await Promise.all(
        (students || []).map(async (student) => {
          const [goals, reflections, projects, badges, activity] = await Promise.all([
            supabase
              .from('curioed_goals')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', student.user_id),
            supabase
              .from('curioed_reflections')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', student.user_id),
            supabase
              .from('curioed_projects')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', student.user_id),
            supabase
              .from('curioed_student_badges')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', student.user_id),
            supabase
              .from('curioed_activity_log')
              .select('occurred_at')
              .eq('user_id', student.user_id)
              .order('occurred_at', { ascending: false })
              .limit(1),
          ]);

          const lastActive = activity.data?.[0]?.occurred_at || student.created_at;
          const daysSinceActive = Math.floor(
            (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Calculate engagement score
          const totalActivity =
            (goals.count || 0) +
            (reflections.count || 0) +
            (projects.count || 0) +
            (badges.count || 0);
          const recencyBonus = Math.max(0, 50 - daysSinceActive * 5);
          const engagementScore = Math.min(100, totalActivity * 5 + recencyBonus);

          return {
            ...student,
            goals_count: goals.count || 0,
            reflections_count: reflections.count || 0,
            projects_count: projects.count || 0,
            badges_count: badges.count || 0,
            engagement_score: engagementScore,
            last_active: lastActive,
          };
        })
      );

      setStudents(studentsWithStats);
      setFilteredStudents(studentsWithStats);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Students</Typography>
        <TextField
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {filteredStudents.length === 0 ? (
        <Card>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              {students.length === 0 ? 'No students assigned' : 'No students found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length === 0
                ? 'Students will appear here once assigned to your class'
                : 'Try a different search term'}
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell align="center">Grade</TableCell>
                  <TableCell align="center">Goals</TableCell>
                  <TableCell align="center">Reflections</TableCell>
                  <TableCell align="center">Projects</TableCell>
                  <TableCell align="center">Badges</TableCell>
                  <TableCell align="center">Engagement</TableCell>
                  <TableCell align="center">Last Active</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {student.first_name} {student.last_name}
                          </Typography>
                          {student.email && (
                            <Typography variant="caption" color="text.secondary">
                              {student.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{student.grade}</TableCell>
                    <TableCell align="center">{student.goals_count}</TableCell>
                    <TableCell align="center">{student.reflections_count}</TableCell>
                    <TableCell align="center">{student.projects_count}</TableCell>
                    <TableCell align="center">{student.badges_count}</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Chip
                          label={getEngagementLabel(student.engagement_score)}
                          color={getEngagementColor(student.engagement_score)}
                          size="small"
                        />
                        <LinearProgress
                          variant="determinate"
                          value={student.engagement_score}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          color={getEngagementColor(student.engagement_score)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {new Date(student.last_active).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" title="View Details">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
