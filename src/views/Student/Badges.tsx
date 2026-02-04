import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabaseClient';
import type { Badge, StudentBadge } from '../../types/database';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  Paper,
  Tooltip,
  Fade,
} from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import LockIcon from '@mui/icons-material/Lock';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface BadgeWithEarned extends Badge {
  earned?: boolean;
  earned_at?: string;
}

const CRAFT_DESCRIPTIONS = {
  curiosity: 'Asking questions, exploring new ideas, and seeking understanding',
  reflection: 'Thinking deeply about your learning journey and growth',
  agency: 'Taking ownership of your learning and making meaningful choices',
  framework: 'Building connections between concepts and organizing knowledge',
  transformation: 'Applying learning to create change and impact in the world',
};

const CRAFT_ICONS: { [key: string]: React.ReactNode } = {
  curiosity: <PsychologyIcon />,
  reflection: <SelfImprovementIcon />,
  agency: <RocketLaunchIcon />,
  framework: <AccountTreeIcon />,
  transformation: <AutoAwesomeIcon />,
};

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeWithEarned[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    try {
      // Fetch all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('curioed_badges')
        .select('*')
        .order('craft_element', { ascending: true });

      if (badgesError) throw badgesError;

      // Fetch user's earned badges
      const { data: earnedBadges, error: earnedError } = await supabase
        .from('curioed_student_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user?.id);

      if (earnedError) throw earnedError;

      // Merge data
      const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id));
      const earnedMap = new Map(earnedBadges?.map((b) => [b.badge_id, b.earned_at]));

      const badgesWithStatus: BadgeWithEarned[] =
        allBadges?.map((badge) => ({
          ...badge,
          earned: earnedBadgeIds.has(badge.id),
          earned_at: earnedMap.get(badge.id),
        })) || [];

      setBadges(badgesWithStatus);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCraftColor = (element: string | null) => {
    const colors: { [key: string]: string } = {
      curiosity: '#9C27B0',
      reflection: '#2196F3',
      agency: '#FF9800',
      framework: '#4CAF50',
      transformation: '#F44336',
    };
    return element ? colors[element] : '#757575';
  };

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  // Group by CRAFT element
  const badgesByCraft = badges.reduce((acc, badge) => {
    const element = badge.craft_element || 'other';
    if (!acc[element]) acc[element] = [];
    acc[element].push(badge);
    return acc;
  }, {} as { [key: string]: BadgeWithEarned[] });

  const craftElements = ['curiosity', 'reflection', 'agency', 'framework', 'transformation'];

  const filteredBadges = selectedElement
    ? badgesByCraft[selectedElement] || []
    : tabValue === 0
    ? badges
    : tabValue === 1
    ? earnedBadges
    : lockedBadges;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Learning Journey
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Badges represent your growth in the CRAFT framework - the skills that make you a powerful learner.
      </Typography>

      {/* CRAFT Framework Overview */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          CRAFT Framework Mastery
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {craftElements.map((element) => {
            const elementBadges = badgesByCraft[element] || [];
            const earned = elementBadges.filter((b) => b.earned).length;
            const total = elementBadges.length;
            const progress = total > 0 ? (earned / total) * 100 : 0;

            return (
              <Grid item xs={12} md={4} key={element}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedElement === element ? '2px solid' : '1px solid',
                    borderColor: selectedElement === element ? getCraftColor(element) : 'divider',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setSelectedElement(selectedElement === element ? null : element)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: getCraftColor(element) }}>
                        {CRAFT_ICONS[element]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                          {element}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {earned} of {total} badges
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getCraftColor(element),
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                      {CRAFT_DESCRIPTIONS[element as keyof typeof CRAFT_DESCRIPTIONS]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Stats Summary - De-emphasized */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {earnedBadges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Badges Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.secondary">
                {lockedBadges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learning Opportunities Ahead
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setSelectedElement(null); }}>
          <Tab label={`All (${badges.length})`} />
          <Tab label={`Earned (${earnedBadges.length})`} />
          <Tab label={`Available (${lockedBadges.length})`} />
        </Tabs>
      </Box>

      {selectedElement && (
        <Chip
          label={`Filtering: ${selectedElement}`}
          onDelete={() => setSelectedElement(null)}
          sx={{ mb: 2, textTransform: 'capitalize' }}
          color="primary"
        />
      )}

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No badges in this category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep learning to grow your CRAFT mastery!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredBadges.map((badge, index) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card
                  sx={{
                    opacity: badge.earned ? 1 : 0.7,
                    position: 'relative',
                    border: badge.earned ? '2px solid' : '1px solid',
                    borderColor: badge.earned ? getCraftColor(badge.craft_element) : 'divider',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Tooltip
                        title={badge.earned ? 'Mastered!' : 'Keep working toward this'}
                        arrow
                      >
                        <Avatar
                          sx={{
                            bgcolor: badge.earned
                              ? getCraftColor(badge.craft_element)
                              : 'grey.400',
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          {badge.earned ? <StarsIcon /> : <LockIcon />}
                        </Avatar>
                      </Tooltip>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {badge.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {badge.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {badge.craft_element && (
                        <Chip
                          icon={CRAFT_ICONS[badge.craft_element] as any}
                          label={badge.craft_element}
                          size="small"
                          sx={{
                            bgcolor: getCraftColor(badge.craft_element),
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      )}
                      {badge.category && (
                        <Chip
                          label={badge.category}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      )}
                    </Box>

                    {badge.earned && badge.earned_at && (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: 'block', mt: 2, fontWeight: 'bold' }}
                      >
                        ✓ Earned on {new Date(badge.earned_at).toLocaleDateString()}
                      </Typography>
                    )}

                    {!badge.earned && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}
                      >
                        Keep growing in {badge.craft_element} to unlock this!
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
