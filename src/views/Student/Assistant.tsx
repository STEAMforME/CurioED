import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  chatWithNovaByte,
  generateQuiz,
  checkHealth,
  parseQuizContent,
  type ChatMessage,
  type QuizQuestion,
} from '../../lib/craftFutureClient';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Fade,
  Grow,
  Alert,
  Collapse,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QuizIcon from '@mui/icons-material/Quiz';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
  isThinking?: boolean;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  answers: string[];
  showResults: boolean;
  score: number;
}

export default function Assistant() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        `Hi ${profile?.first_name || 'there'}! 👋 I'm Nova Byte, your learning companion. I'm here to help you explore, question, and discover. What are you curious about today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [quizMode, setQuizMode] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [quizTopic, setQuizTopic] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkApiHealth = async () => {
    const health = await checkHealth();
    setApiStatus(health.status === 'healthy' ? 'online' : 'offline');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string, isThinking = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      isThinking,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, content: string, isThinking = false) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content, isThinking } : msg
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    // Check if user wants a quiz
    const quizKeywords = ['quiz', 'test', 'questions', 'practice'];
    const wantsQuiz = quizKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );

    if (wantsQuiz) {
      // Extract topic from message
      const topic = userMessage
        .replace(/quiz|test|questions|practice|about|on/gi, '')
        .trim();
      if (topic) {
        await handleQuizGeneration(topic);
      } else {
        addMessage(
          'assistant',
          'I'd love to create a quiz for you! What topic would you like to explore?'
        );
        setIsLoading(false);
      }
      return;
    }

    // Regular Socratic chat
    const thinkingId = addMessage(
      'assistant',
      'Thinking about your question... 🤔',
      true
    );

    try {
      const conversationHistory = messages
        .filter((m) => !m.isThinking)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await chatWithNovaByte(userMessage, conversationHistory);

      if (response.success && response.response) {
        updateMessage(thinkingId, response.response, false);
      } else {
        updateMessage(
          thinkingId,
          `I'm having trouble connecting right now. ${response.error || 'Please try again in a moment.'}`,
          false
        );
      }
    } catch (error) {
      updateMessage(
        thinkingId,
        'Something unexpected happened. Let me try again with a different approach to your question.',
        false
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizGeneration = async (topic: string) => {
    setQuizTopic(topic);
    const thinkingId = addMessage(
      'assistant',
      `Creating a personalized quiz about ${topic}... This may take 60-90 seconds. ⏳`,
      true
    );

    try {
      const gradeLevel = profile?.grade || 8;
      const response = await generateQuiz(topic, gradeLevel, 5);

      if (response.success && response.quiz_content) {
        const questions = parseQuizContent(response.quiz_content);
        
        if (questions.length > 0) {
          setQuizState({
            questions,
            currentQuestion: 0,
            answers: new Array(questions.length).fill(''),
            showResults: false,
            score: 0,
          });
          setQuizMode(true);
          updateMessage(
            thinkingId,
            `Great! I've created ${questions.length} questions about ${topic}. Take your time and think deeply about each one. There's no rush! 🎯`,
            false
          );
        } else {
          updateMessage(
            thinkingId,
            `I had trouble formatting the quiz. Here's what I generated:\n\n${response.quiz_content}`,
            false
          );
        }
      } else {
        updateMessage(
          thinkingId,
          `I couldn't generate a quiz right now. ${response.error || 'The AI might be warming up. Try again in a moment!'} 💡`,
          false
        );
      }
    } catch (error) {
      updateMessage(
        thinkingId,
        'Quiz generation is temporarily unavailable. Try asking me questions about the topic instead!',
        false
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (!quizState) return;

    const newAnswers = [...quizState.answers];
    newAnswers[quizState.currentQuestion] = answer;

    setQuizState({
      ...quizState,
      answers: newAnswers,
    });
  };

  const handleNextQuestion = () => {
    if (!quizState) return;

    if (quizState.currentQuestion < quizState.questions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
      });
    } else {
      // Calculate score
      let score = 0;
      quizState.questions.forEach((q, i) => {
        if (q.correctAnswer && quizState.answers[i] === q.correctAnswer) {
          score++;
        }
      });

      setQuizState({
        ...quizState,
        showResults: true,
        score,
      });

      // Add completion message
      addMessage(
        'assistant',
        `Excellent work! You scored ${score} out of ${quizState.questions.length} on ${quizTopic}. ${score >= quizState.questions.length * 0.8 ? "You've mastered this topic! 🌟" : score >= quizState.questions.length * 0.6 ? "You're making great progress! Keep learning! 📚" : "This is a learning opportunity. Let's explore this topic more together! 💡"}`
      );
    }
  };

  const handleRestartQuiz = () => {
    setQuizMode(false);
    setQuizState(null);
    setQuizTopic('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSocraticPrompts = () => {
    const prompts = [
      "What makes you curious about that?",
      "Tell me about a topic you're learning in school",
      "What would you like to understand better?",
      "Is there a problem you're trying to solve?",
      "What project are you working on?",
    ];
    return prompts;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon fontSize="large" color="primary" />
            Nova Byte
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your AI Learning Companion
          </Typography>
        </Box>
        <Chip
          label={apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Connecting...'}
          color={apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'error' : 'default'}
          size="small"
          icon={apiStatus === 'checking' ? <CircularProgress size={16} /> : undefined}
        />
      </Box>

      {/* API Offline Warning */}
      <Collapse in={apiStatus === 'offline'}>
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setApiStatus('checking')}>
          Nova Byte is currently offline. Make sure the CRAFTFuture API is running on your iMac at localhost:8000
        </Alert>
      </Collapse>

      {/* Messages Container */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 3,
          overflowY: 'auto',
          backgroundColor: 'background.default',
          mb: 2,
        }}
      >
        {messages.map((message, index) => (
          <Fade in key={message.id} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SmartToyIcon />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                {message.isThinking ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body1">{message.content}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 2 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Quiz Interface */}
      {quizMode && quizState && !quizState.showResults && (
        <Grow in>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Question {quizState.currentQuestion + 1} of {quizState.questions.length}
                </Typography>
                <IconButton onClick={handleRestartQuiz} size="small">
                  <CancelIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                {quizState.questions[quizState.currentQuestion].question}
              </Typography>

              {quizState.questions[quizState.currentQuestion].options && (
                <RadioGroup
                  value={quizState.answers[quizState.currentQuestion]}
                  onChange={(e) => handleQuizAnswer(e.target.value)}
                >
                  {quizState.questions[quizState.currentQuestion].options?.map((option, i) => (
                    <FormControlLabel
                      key={i}
                      value={String.fromCharCode(65 + i)}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              )}

              <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={!quizState.answers[quizState.currentQuestion]}
                sx={{ mt: 2 }}
              >
                {quizState.currentQuestion < quizState.questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            </CardContent>
          </Card>
        </Grow>
      )}

      {/* Quiz Results */}
      {quizMode && quizState?.showResults && (
        <Grow in>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quiz Complete! 🎉
              </Typography>
              <Typography variant="h3" color="primary" gutterBottom>
                {quizState.score} / {quizState.questions.length}
              </Typography>
              
              {quizState.questions.map((q, i) => (
                <Box key={i} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {quizState.answers[i] === q.correctAnswer ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                    <Typography variant="body2" fontWeight="bold">
                      Question {i + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{q.question}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your answer: {quizState.answers[i] || 'Not answered'} | Correct: {q.correctAnswer}
                  </Typography>
                  {q.explanation && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      💡 {q.explanation}
                    </Typography>
                  )}
                </Box>
              ))}

              <Button variant="contained" onClick={handleRestartQuiz} startIcon={<RefreshIcon />}>
                Try Another Quiz
              </Button>
            </CardContent>
          </Card>
        </Grow>
      )}

      {/* Socratic Prompts */}
      {messages.length <= 1 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {getSocraticPrompts().map((prompt, i) => (
            <Chip
              key={i}
              label={prompt}
              icon={<LightbulbIcon />}
              onClick={() => {
                setInput(prompt);
                inputRef.current?.focus();
              }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything or request a quiz..."
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          💡 Try: "Quiz me on robotics" or "Help me understand photosynthesis"
        </Typography>
      </Paper>
    </Box>
  );
}
