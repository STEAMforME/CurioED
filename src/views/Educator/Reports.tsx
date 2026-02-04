import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface ReportData {
  student_name: string;
  grade: number;
  goals_total: number;
  goals_completed: number;
  reflections_count: number;
  projects_count: number;
  badges_count: number;
  engagement_score: number;
  craft_distribution: { [key: string]: number };
}

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('engagement');
  const [timeframe, setTimeframe] = useState('month');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setGenerated(false);

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

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeframe === 'semester') {
        startDate.setMonth(startDate.getMonth() - 6);
      }

      // Fetch student data
      const { data: students } = await supabase
        .from('curioed_students')
        .select('*')
        .in('user_id', studentIds);

      // Compile report data
      const reportPromises = (students || []).map(async (student) => {
        const [goals, reflections, projects, badges] = await Promise.all([
          supabase
            .from('curioed_goals')
            .select('*')
            .eq('user_id', student.user_id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('curioed_reflections')
            .select('craft_element')
            .eq('user_id', student.user_id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('curioed_projects')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', student.user_id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('curioed_student_badges')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', student.user_id)
            .gte('earned_at', startDate.toISOString()),
        ]);

        // Calculate C.R.A.F.T. distribution
        const craftDistribution: { [key: string]: number } = {
          curiosity: 0,
          reflection: 0,
          agency: 0,
          framework: 0,
          transformation: 0,
        };

        reflections.data?.forEach((r) => {
          if (r.craft_element) {
            craftDistribution[r.craft_element] =
              (craftDistribution[r.craft_element] || 0) + 1;
          }
        });

        const completedGoals = goals.data?.filter((g) => g.completed).length || 0;
        const totalActivity =
          (goals.data?.length || 0) +
          (reflections.data?.length || 0) +
          (projects.count || 0) +
          (badges.count || 0);
        const engagementScore = Math.min(100, totalActivity * 5);

        return {
          student_name: `${student.first_name} ${student.last_name}`,
          grade: student.grade,
          goals_total: goals.data?.length || 0,
          goals_completed: completedGoals,
          reflections_count: reflections.data?.length || 0,
          projects_count: projects.count || 0,
          badges_count: badges.count || 0,
          engagement_score: engagementScore,
          craft_distribution: craftDistribution,
        };
      });

      const compiledReport = await Promise.all(reportPromises);
      setReportData(compiledReport);
      setGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const headers = [
      'Student Name',
      'Grade',
      'Goals (Total)',
      'Goals (Completed)',
      'Reflections',
      'Projects',
      'Badges',
      'Engagement Score',
      'Curiosity',
      'Reflection',
      'Agency',
      'Framework',
      'Transformation',
    ];

    const rows = reportData.map((row) => [
      row.student_name,
      row.grade,
      row.goals_total,
      row.goals_completed,
      row.reflections_count,
      row.projects_count,
      row.badges_count,
      row.engagement_score,
      row.craft_distribution.curiosity || 0,
      row.craft_distribution.reflection || 0,
      row.craft_distribution.agency || 0,
      row.craft_distribution.framework || 0,
      row.craft_distribution.transformation || 0,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curioed-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Report Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="engagement">Engagement Summary</MenuItem>
                  <MenuItem value="craft">C.R.A.F.T. Analysis</MenuItem>
                  <MenuItem value="progress">Progress Tracking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="semester">Last Semester</MenuItem>
                  <MenuItem value="year">Full Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={generateReport}
                disabled={loading}
                startIcon={<AssessmentIcon />}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Report Results */}
      {generated && reportData.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Report Results</Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </Box>

          <Grid container spacing={2}>
            {reportData.map((student, idx) => (
              <Grid item xs={12} key={idx}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{student.student_name}</Typography>
                      <Chip label={`Grade ${student.grade}`} />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Goals
                        </Typography>
                        <Typography variant="h6">
                          {student.goals_completed}/{student.goals_total}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Reflections
                        </Typography>
                        <Typography variant="h6">{student.reflections_count}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Projects
                        </Typography>
                        <Typography variant="h6">{student.projects_count}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Engagement
                        </Typography>
                        <Typography variant="h6">{student.engagement_score}%</Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        C.R.A.F.T. Distribution
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(student.craft_distribution).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {generated && reportData.length === 0 && (
        <Alert severity="info">No data available for the selected timeframe.</Alert>
      )}
    </Box>
  );
}
