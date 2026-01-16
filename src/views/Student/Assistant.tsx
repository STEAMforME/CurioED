import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatWithNovaByte, generateQuiz, type ChatResult, type QuizResult } from '../../lib/craftFutureClient';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Fade,
  Slide,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ content: string; metadata?: any }>;
}

const STARTER_PROMPTS = [
  '🤔 How does photosynthesis work?',
  '🚀 What makes rockets fly?',
  '🧠 Why is math important in real life?',
  '🎨 How can art and science connect?',
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I'm Nova Byte, your learning companion. I'm here to help you explore, question, and discover. What are you curious about today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizGrade, setQuizGrade] = useState(6);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const result: ChatResult = await chatWithNovaByte(input);

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
          sources: result.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(result.error || 'Failed to get response from Nova Byte');
      }
    } catch (err) {
      setError('Connection error. Make sure CRAFTFuture API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt.substring(2).trim()); // Remove emoji
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return;

    setGeneratingQuiz(true);
    setError(null);

    try {
      const result: QuizResult = await generateQuiz(quizTopic, quizGrade, 5);

      if (result.success && result.quiz_content) {
        const quizMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've created a quiz about "${quizTopic}" for grade ${quizGrade}:\n\n${result.quiz_content}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, quizMessage]);
        setShowQuizOptions(false);
        setQuizTopic('');
      } else {
        setError(result.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Quiz generation failed. This may take 60-90 seconds on first use.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Nova Byte
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Socratic Learning Companion
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!showQuizOptions ? (
              <Button
                startIcon={<QuizIcon />}
                variant="outlined"
                size="small"
                onClick={() => setShowQuizOptions(true)}
                sx={{
                  borderColor: '#EC4899',
                  color: '#EC4899',
                  '&:hover': { borderColor: '#EC4899', bgcolor: 'rgba(236, 72, 153, 0.05)' },
                }}
              >
                Generate Quiz
              </Button>
            ) : (
              <Button
                variant="text"
                size="small"
                onClick={() => setShowQuizOptions(false)}
              >
                Cancel Quiz
              </Button>
            )}
          </Box>
        </Box>
      </Fade>

      {/* Quiz Options */}
      <Collapse in={showQuizOptions}>
        <Card sx={{ mb: 3, borderLeft: '4px solid #EC4899' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Generate Learning Quiz
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Quiz Topic"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., robotics basics, photosynthesis"
                size="small"
                sx={{ flexGrow: 1, minWidth: 200 }}
              />
              <TextField
                label="Grade Level"
                type="number"
                value={quizGrade}
                onChange={(e) => setQuizGrade(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
                size="small"
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                onClick={handleGenerateQuiz}
                disabled={!quizTopic.trim() || generatingQuiz}
                startIcon={generatingQuiz ? <CircularProgress size={20} /> : <QuizIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #EC4899 30%, #6366F1 90%)',
                }}
              >
                Generate
              </Button>
            </Box>
            {generatingQuiz && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Generating your quiz... This may take 60-90 seconds on first use. 🧠
              </Alert>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Messages Container */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: 'grey.50',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {messages.map((message, index) => (
          <Slide
            key={message.id}
            direction={message.role === 'user' ? 'left' : 'right'}
            in
            timeout={300 + index * 50}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  maxWidth: '80%',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      message.role === 'user'
                        ? '#6366F1'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Box>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      bgcolor: message.role === 'user' ? '#6366F1' : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                  {message.sources && message.sources.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {message.sources.map((source, idx) => (
                        <Chip
                          key={idx}
                          label={`Source ${idx + 1}`}
                          size="small"
                          icon={<LightbulbIcon />}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Slide>
        ))}

        {loading && (
          <Fade in>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <SmartToyIcon />
              </Avatar>
              <Paper elevation={2} sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Nova Byte is thinking...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Starter Prompts (show when no messages yet) */}
      {messages.length === 1 && (
        <Fade in timeout={1000}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Try asking:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {STARTER_PROMPTS.map((prompt, index) => (
                <Chip
                  key={index}
                  label={prompt}
                  onClick={() => handleStarterPrompt(prompt)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.05)', bgcolor: 'primary.light', color: 'white' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything about learning, science, or any topic you're curious about..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            sx={{
              minWidth: 100,
              background: 'linear-gradient(45deg, #6366F1 30%, #EC4899 90%)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>
    </Box>
  );
}
