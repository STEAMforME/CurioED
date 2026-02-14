import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import type { Goal } from '../../types/database';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const CRAFT_ELEMENTS = [
  { value: 'curiosity', label: '🔍 Curiosity', color: '#9C27B0' },
  { value: 'reflection', label: '💭 Reflection', color: '#2196F3' },
  { value: 'agency', label: '⚡ Agency', color: '#FF9800' },
  { value: 'framework', label: '🏗️ Framework', color: '#4CAF50' },
  { value: 'transformation', label: '🦋 Transformation', color: '#F44336' },
];

const CATEGORIES = [
  { value: 'academic', label: '📚 Academic' },
  { value: 'personal', label: '🌟 Personal' },
  { value: 'career', label: '💼 Career' },
  { value: 'skill', label: '🛠️ Skill' },
];

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic' as Goal['category'],
    target_date: '',
    craft_element: 'curiosity',
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('curioed_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category || 'academic',
        target_date: goal.target_date || '',
        craft_element: goal.craft_element || 'curiosity',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'academic',
        target_date: '',
        craft_element: 'curiosity',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async () => {
    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('curioed_goals')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingGoal.id);

        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await supabase.from('curioed_goals').insert({
          user_id: user?.id,
          ...formData,
          progress: 0,
          completed: false,
        });

        if (error) throw error;
      }

      await fetchGoals();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('curioed_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleProgressUpdate = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('curioed_goals')
        .update({
          progress: newProgress,
          completed: newProgress >= 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;
      await fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getCraftColor = (element: string) => {
    return CRAFT_ELEMENTS.find((e) => e.value === element)?.color || '#757575';
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">🎯 My Learning Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(45deg, #6366F1 30%, #EC4899 90%)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          New Goal
        </Button>
      </Box>

      {/* Stats Summary */}
      <Fade in timeout={800}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {activeGoals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Goals
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {completedGoals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {Math.round(
                  activeGoals.reduce((sum, g) => sum + g.progress, 0) / (activeGoals.length || 1)
                )}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Progress
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Active Goals */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Active Goals
      </Typography>
      {activeGoals.length === 0 ? (
        <Fade in>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" gutterBottom>
                No active goals yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first learning goal to start your journey!
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Create Goal
              </Button>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeGoals.map((goal, index) => (
            <Grow in key={goal.id} timeout={300 + index * 100}>
              <Card
                sx={{
                  borderLeft: `4px solid ${getCraftColor(goal.craft_element || 'curiosity')}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{goal.title}</Typography>
                      {goal.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {goal.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="medium" aria-label= "Edit goal"onClick={() => handleOpenDialog(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="medium" aria-label= "Delete goal"onClick={() => handleDeleteGoal(goal.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {goal.category && (
                      <Chip
                        label={CATEGORIES.find((c) => c.value === goal.category)?.label || goal.category}
                        size="small"
                      />
                    )}
                    {goal.craft_element && (
                      <Chip
                        label={CRAFT_ELEMENTS.find((e) => e.value === goal.craft_element)?.label}
                        size="small"
                        sx={{
                          bgcolor: getCraftColor(goal.craft_element),
                          color: 'white',
                        }}
                      />
                    )}
                    {goal.target_date && (
                      <Chip
                        label={`Due: ${new Date(goal.target_date).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress: {goal.progress}%
                      </Typography>
                      <IconButton
                        size="ssize="medium" aria-label="Increase progress by 10%"
                        onClick={() => handleProgressUpdate(goal.id, Math.min(goal.progress + 10, 100))}
                      >
                        <TrendingUpIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getCraftColor(goal.craft_element || 'curiosity'),
                          transition: 'transform 0.5s ease',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Completed Goals
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {completedGoals.map((goal) => (
              <Fade in key={goal.id}>
                <Card sx={{ opacity: 0.8 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{goal.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed on {new Date(goal.updated_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <IconButton size="medium" aria-label="Delete completed goal"
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                label="Category"
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>CRAFT Element</InputLabel>
              <Select
                value={formData.craft_element}
                onChange={(e) => setFormData({ ...formData, craft_element: e.target.value })}
                label="CRAFT Element"
              >
                {CRAFT_ELEMENTS.map((element) => (
                  <MenuItem key={element.value} value={element.value}>
                    {element.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Target Date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveGoal}
            variant="contained"
            disabled={!formData.title.trim()}
          >
            {editingGoal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
