import { Card, CardContent, Typography, LinearProgress, Box, Chip, Button, Stack } from '@mui/material';
import { EmojiEvents, Star } from '@mui/icons-material';

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    progress: number;
    xpReward: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    completed: boolean;
  };
  onStart: (questId: string) => void;
}

export default function QuestCard({ quest, onStart }: QuestCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{quest.title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>{quest.description}</Typography>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip label={quest.difficulty} size="small" />
          <Chip icon={<Star />} label={`${quest.xpReward} XP`} size="small" />
        </Stack>
        <Box mb={2}>
          <Typography variant="caption">Progress: {quest.progress}%</Typography>
          <LinearProgress variant="determinate" value={quest.progress} />
        </Box>
        {!quest.completed && <Button variant="contained" fullWidth onClick={() => onStart(quest.id)}>Start Quest</Button>}
      </CardContent>
    </Card>
  );
}
