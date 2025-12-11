import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
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
} from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import LockIcon from '@mui/icons-material/Lock';

interface BadgeWithEarned extends Badge {
  earned?: boolean;
  earned_at?: string;
}

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeWithEarned[]>([]);
  const [tabValue, setTabValue] = useState(0);
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
        .order('points', { ascending: true });

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

  const filteredBadges =
    tabValue === 0
      ? badges
      : tabValue === 1
      ? earnedBadges
      : lockedBadges;

  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Badges
      </Typography>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
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
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {totalPoints}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.secondary">
                {lockedBadges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To Unlock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${badges.length})`} />
          <Tab label={`Earned (${earnedBadges.length})`} />
          <Tab label={`Locked (${lockedBadges.length})`} />
        </Tabs>
      </Box>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No badges in this category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep learning to earn more badges!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredBadges.map((badge) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <Card
                sx={{
                  opacity: badge.earned ? 1 : 0.6,
                  position: 'relative',
                  border: badge.earned ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {badge.name}
                      </Typography>
                      <Chip
                        label={`${badge.points} pts`}
                        size="small"
                        color={badge.earned ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {badge.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {badge.category && (
                      <Chip
                        label={badge.category}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    )}
                    {badge.craft_element && (
                      <Chip
                        label={badge.craft_element}
                        size="small"
                        sx={{
                          bgcolor: getCraftColor(badge.craft_element),
                          color: 'white',
                          textTransform: 'capitalize',
                        }}
                      />
                    )}
                  </Box>

                  {badge.earned && badge.earned_at && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 2 }}
                    >
                      Earned on {new Date(badge.earned_at).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
