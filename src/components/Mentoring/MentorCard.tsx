import { Card, CardContent, CardActions, Avatar, Typography, Chip, Button, Box, Rating, Stack } from '@mui/material';
import { VideoCall, CalendarToday, School } from '@mui/icons-material';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    avatar?: string;
    expertise: string[];
    rating: number;
    sessionsCompleted: number;
    bio: string;
    available: boolean;
  };
  onBookSession: (mentorId: string) => void;
}

export default function MentorCard({ mentor, onBookSession }: MentorCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={mentor.avatar} sx={{ width: 64, height: 64, mr: 2 }}>{mentor.name[0]}</Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6">{mentor.name}</Typography>
            <Rating value={mentor.rating} readOnly size="small" />
          </Box>
          {mentor.available && <Chip label="Available" color="success" size="small" />}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>{mentor.bio}</Typography>
        <Stack direction="row" spacing={1}>
          {mentor.expertise.map((skill) => <Chip key={skill} label={skill} size="small" icon={<School />} />)}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<CalendarToday />} onClick={() => onBookSession(mentor.id)}>Book</Button>
      </CardActions>
    </Card>
  );
}
