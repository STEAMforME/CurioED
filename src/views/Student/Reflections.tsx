import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import type { Reflection } from '../../types/database';
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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const CRAFT_ELEMENTS = [
  { value: 'curiosity', label: 'Curiosity', color: '#9C27B0' },
  { value: 'reflection', label: 'Reflection', color: '#2196F3' },
  { value: 'agency', label: 'Agency', color: '#FF9800' },
  { value: 'framework', label: 'Framework', color: '#4CAF50' },
  { value: 'transformation', label: 'Transformation', color: '#F44336' },
];

export default function Reflections() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [open, setOpen] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    week_of: new Date().toISOString().split('T')[0],
    craft_element: '' as any,
    mood: '' as any,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  const fetchReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('curioed_reflections')
        .select('*')
        .eq('user_id', user?.id)
        .order('week_of', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (reflection?: Reflection) => {
    if (reflection) {
      setEditingReflection(reflection);
      setFormData({
        content: reflection.content,
        week_of: reflection.week_of,
        craft_element: reflection.craft_element || '',
        mood: reflection.mood || '',
      });
    } else {
      setEditingReflection(null);
      setFormData({
        content: '',
        week_of: new Date().toISOString().split('T')[0],
        craft_element: '',
        mood: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReflection(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingReflection) {
        const { error } = await supabase
          .from('curioed_reflections')
          .update(formData)
          .eq('id', editingReflection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('curioed_reflections').insert({
          user_id: user?.id,
          ...formData,
        });

        if (error) throw error;
      }

      fetchReflections();
      handleClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const deleteReflection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reflection?')) return;

    try {
      const { error } = await supabase
        .from('curioed_reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReflections();
    } catch (error) {
      console.error('Error deleting reflection:', error);
    }
  };

  const getMoodIcon = (mood: string | undefined) => {
    switch (mood) {
      case 'excited':
        return <SentimentVerySatisfiedIcon />;
      case 'confident':
        return <SentimentSatisfiedIcon />;
      case 'neutral':
        return <SentimentNeutralIcon />;
      case 'frustrated':
        return <SentimentDissatisfiedIcon />;
      case 'confused':
        return <SentimentVeryDissatisfiedIcon />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Reflections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Reflection
        </Button>
      </Box>

      {reflections.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No reflections yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start reflecting on your learning journey!
            </Typography>
            <Button variant="contained" onClick={() => handleOpen()}>
              Write Your First Reflection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {reflections.map((reflection) => {
            const craftElement = CRAFT_ELEMENTS.find(
              (e) => e.value === reflection.craft_element
            );
            return (
              <Grid item xs={12} key={reflection.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">
                          Week of {new Date(reflection.week_of).toLocaleDateString()}
                        </Typography>
                        {reflection.mood && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getMoodIcon(reflection.mood)}
                          </Box>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpen(reflection)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteReflection(reflection.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {reflection.content}
                    </Typography>

                    {craftElement && (
                      <Chip
                        label={craftElement.label}
                        size="small"
                        sx={{
                          bgcolor: craftElement.color,
                          color: 'white',
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReflection ? 'Edit Reflection' : 'New Weekly Reflection'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Week Of"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.week_of}
              onChange={(e) => setFormData({ ...formData, week_of: e.target.value })}
            />
            <TextField
              label="Your Reflection"
              fullWidth
              multiline
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What did you learn this week? What challenges did you face? What are you proud of?"
              required
            />
            <FormControl fullWidth>
              <InputLabel>C.R.A.F.T. Element</InputLabel>
              <Select
                value={formData.craft_element}
                label="C.R.A.F.T. Element"
                onChange={(e) =>
                  setFormData({ ...formData, craft_element: e.target.value as any })
                }
              >
                <MenuItem value="">None</MenuItem>
                {CRAFT_ELEMENTS.map((element) => (
                  <MenuItem key={element.value} value={element.value}>
                    {element.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" gutterBottom>
                How are you feeling?
              </Typography>
              <ToggleButtonGroup
                value={formData.mood}
                exclusive
                onChange={(e, value) => setFormData({ ...formData, mood: value })}
                fullWidth
              >
                <ToggleButton value="excited">
                  <SentimentVerySatisfiedIcon /> Excited
                </ToggleButton>
                <ToggleButton value="confident">
                  <SentimentSatisfiedIcon /> Confident
                </ToggleButton>
                <ToggleButton value="neutral">
                  <SentimentNeutralIcon /> Neutral
                </ToggleButton>
                <ToggleButton value="frustrated">
                  <SentimentDissatisfiedIcon /> Frustrated
                </ToggleButton>
                <ToggleButton value="confused">
                  <SentimentVeryDissatisfiedIcon /> Confused
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.content}>
            {editingReflection ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
