import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateQuiz, askNovaByte, checkAPIHealth } from '../../lib/craftFutureClient';
import type { QuizResponse } from '../../lib/craftFutureClient';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuizIcon from '@mui/icons-material/Quiz';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quiz';
  quizData?: QuizResponse;
}

export default function Assistant() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${profile?.first_name || 'there'}! 👋 I'm Nova Byte, your AI learning companion. I'm here to help you explore, question, and discover! What are you curious about today?`,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth().then((result) => setApiHealthy(result.healthy));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Detect if user wants a quiz
      const isQuizRequest = /quiz|test|questions|practice/i.test(input);

      if (isQuizRequest && activeTab === 1) {
        // Extract topic from input (simple heuristic)
        const topic = input
          .replace(/quiz|test|questions|about|on|practice/gi, '')
          .trim();
        
        const quizResponse = await generateQuiz(
          topic || 'general knowledge',
          profile?.grade || 6,
          5,
          'multiple_choice'
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: quizResponse.success
            ? `Great! I've created a quiz about "${quizResponse.topic}" for you. Take your time and think through each question! 🧠`
            : `Hmm, I had trouble creating that quiz. ${quizResponse.error || 'Please try again!'}`,
          timestamp: new Date(),
          type: quizResponse.success ? 'quiz' : 'text',
          quizData: quizResponse.success ? quizResponse : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Socratic chat mode
        const chatResponse = await askNovaByte(
          input,
          messages.slice(-4).map((m) => m.content)
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatResponse.success
            ? chatResponse.response || 'I\'m thinking... 🤔'
            : `I\'m having trouble connecting right now. ${chatResponse.error || 'Please try again!'}`,
          timestamp: new Date(),
          type: 'text',
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Oops! Something went wrong. Make sure the CRAFT API is running at http://localhost:8000',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderQuizContent = (message: Message) => {
    if (!message.quizData?.quiz_content) return null;

    const isExpanded = expandedQuiz === message.id;

    return (
      <Card sx={{ mt: 2, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuizIcon color="primary" />
              <Typography variant="h6" color="primary">
                {message.quizData.topic} Quiz
              </Typography>
              <Chip label={`Grade ${message.quizData.grade_level}`} size="small" color="primary" />
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpandedQuiz(isExpanded ? null : message.id)}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Typography
              variant="body2"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                bgcolor: 'white',
                p: 2,
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {message.quizData.quiz_content}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Chip icon={<LightbulbIcon />} label="Take your time" size="small" />
              <Chip icon={<QuizIcon />} label={`${message.quizData.num_questions} questions`} size="small" />
            </Box>
          </Collapse>

          {!isExpanded && (
            <Typography variant="body2" color="text.secondary">
              Click to expand quiz questions
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMessage = (message: Message, index: number) => (
    <Slide direction="up" in={true} key={message.id} timeout={300 + index * 50}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          mb: 2,
          gap: 1,
        }}
      >
        {message.role === 'assistant' && (
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <SmartToyIcon />
          </Avatar>
        )}

        <Paper
          elevation={2}
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
            color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            animation: 'fadeIn 0.3s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>

          {message.type === 'quiz' && renderQuizContent(message)}
        </Paper>

        {message.role === 'user' && (
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <PersonIcon />
          </Avatar>
        )}
      </Box>
    </Slide>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <SmartToyIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                Nova Byte Assistant
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<SmartToyIcon />}
                  label="Socratic AI Tutor"
                  size="small"
                  color="primary"
                />
                {apiHealthy !== null && (
                  <Chip
                    label={apiHealthy ? 'Online' : 'Offline'}
                    size="small"
                    color={apiHealthy ? 'success' : 'error'}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<LightbulbIcon />} label="Socratic Chat" />
          <Tab icon={<QuizIcon />} label="Quiz Mode" />
        </Tabs>

        {apiHealthy === false && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            CRAFT API is offline. Make sure it's running at http://localhost:8000
          </Alert>
        )}
      </Box>

      {/* Messages Area */}
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {messages.map((msg, idx) => renderMessage(msg, idx))}

        {loading && (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SmartToyIcon />
              </Avatar>
              <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Nova is thinking...</Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={
                activeTab === 0
                  ? "Ask me anything! I'll help you discover the answer..."
                  : "Ask for a quiz on any topic (e.g., 'quiz on photosynthesis')..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || apiHealthy === false}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSend}
              disabled={!input.trim() || loading || apiHealthy === false}
              size="large"
              sx={{ height: 56 }}
            >
              Send
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {activeTab === 0 && (
            <>
              <Chip
                label="What is photosynthesis?"
                size="small"
                onClick={() => setInput('What is photosynthesis?')}
                clickable
              />
              <Chip
                label="How do robots work?"
                size="small"
                onClick={() => setInput('How do robots work?')}
                clickable
              />
              <Chip
                label="Why is the sky blue?"
                size="small"
                onClick={() => setInput('Why is the sky blue?')}
                clickable
              />
            </>
          )}
          {activeTab === 1 && (
            <>
              <Chip
                label="Quiz on solar system"
                size="small"
                onClick={() => setInput('quiz on solar system')}
                clickable
              />
              <Chip
                label="Test me on fractions"
                size="small"
                onClick={() => setInput('test me on fractions')}
                clickable
              />
              <Chip
                label="Practice coding concepts"
                size="small"
                onClick={() => setInput('practice coding concepts')}
                clickable
              />
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
