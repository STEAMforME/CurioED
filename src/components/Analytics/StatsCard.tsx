import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}: StatsCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="caption" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: trend.isPositive ? 'success.main' : 'error.main',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
