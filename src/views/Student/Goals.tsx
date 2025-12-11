import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { Goal } from '../../types/database';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as 'academic' | 'personal' | 'career' | 'skill',
    target_date: '',
    progress: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const handleOpen = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category || 'personal',
        target_date: goal.target_date || '',
        progress: goal.progress,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        target_date: '',
        progress: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('curioed_goals')
          .update(formData)
          .eq('id', editingGoal.id);

        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await supabase.from('curioed_goals').insert({
          user_id: user?.id,
          ...formData,
          completed: false,
        });

        if (error) throw error;
      }

      fetchGoals();
      handleClose();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const toggleComplete = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from('curioed_goals')
        .update({ 
          completed: !goal.completed,
          progress: !goal.completed ? 100 : goal.progress 
        })
        .eq('id', goal.id);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase.from('curioed_goals').delete().eq('id', id);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: 'primary' | 'success' | 'warning' | 'info' } = {
      academic: 'primary',
      personal: 'success',
      career: 'warning',
      skill: 'info',
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No goals yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start your journey by creating your first goal!
            </Typography>
            <Button variant="contained" onClick={() => handleOpen()}>
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} key={goal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => toggleComplete(goal)}
                        color={goal.completed ? 'success' : 'default'}
                      >
                        {goal.completed ? (
                          <CheckCircleIcon />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: goal.completed ? 'line-through' : 'none',
                          color: goal.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {goal.title}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpen(goal)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteGoal(goal.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={goal.category}
                      size="small"
                      color={getCategoryColor(goal.category || '')}
                      sx={{ textTransform: 'capitalize' }}
                    />
                    {goal.target_date && (
                      <Chip
                        label={`Due: ${new Date(goal.target_date).toLocaleDateString()}`}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{goal.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Goal Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as 'academic' | 'personal' | 'career' | 'skill',
                  })
                }
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="career">Career</MenuItem>
                <MenuItem value="skill">Skill</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
            <Box>
              <Typography gutterBottom>Progress: {formData.progress}%</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
            {editingGoal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
