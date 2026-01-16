/**
 * CRAFTFuture API Client
 * Connects CurioED frontend to CRAFTFuture backend (Nova Byte)
 * Running on iMac at localhost:8000
 */

const CRAFT_API_URL = import.meta.env.VITE_CRAFT_API_URL || 'http://localhost:8000';

export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuizResponse {
  success: boolean;
  topic?: string;
  grade_level?: number;
  num_questions?: number;
  type?: string;
  quiz_content?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sources?: Array<{
    content: string;
    collection: string;
    score: number;
  }>;
  error?: string;
}

export interface HealthResponse {
  status: string;
  models?: Array<{
    name: string;
    size: number;
  }>;
}

/**
 * Check if CRAFTFuture API is available
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/health`, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('CRAFTFuture API health check failed:', error);
    return { status: 'offline' };
  }
}

/**
 * Generate educational quiz using Nova Byte
 * @param topic - Subject matter (e.g., "robotics basics")
 * @param gradeLevel - Student grade level (1-12)
 * @param numQuestions - Number of questions to generate (default: 5)
 * @param questionType - Type of questions (default: "multiple_choice")
 */
export async function generateQuiz(
  topic: string,
  gradeLevel: number,
  numQuestions: number = 5,
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' = 'multiple_choice'
): Promise<QuizResponse> {
  try {
    const response = await fetch(
      `${CRAFT_API_URL}/generate-quiz?` +
        new URLSearchParams({
          topic,
          grade: gradeLevel.toString(),
          num_questions: numQuestions.toString(),
        }),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Quiz generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating quiz:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Chat with Nova Byte using RAG-powered responses
 * @param message - User's question or message
 * @param conversationHistory - Previous messages for context
 */
export async function chatWithNovaByte(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error chatting with Nova Byte:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Search across all knowledge bases (grants, curriculum, code, research)
 * @param query - Search query
 * @param limit - Maximum number of results (default: 3)
 */
export async function searchKnowledge(
  query: string,
  limit: number = 3
): Promise<ChatResponse> {
  try {
    const response = await fetch(
      `${CRAFT_API_URL}/search-all?` +
        new URLSearchParams({
          query,
          limit: limit.toString(),
        }),
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Parse quiz content into structured format
 * Handles the text-based quiz format from Nova Byte
 */
export function parseQuizContent(content: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const questionBlocks = content.split(/Q\d+:?/).filter((block) => block.trim());

  questionBlocks.forEach((block) => {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return;

    const question = lines[0].trim();
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[A-D][).]\s/)) {
        options.push(line.substring(2).trim());
      } else if (line.toLowerCase().includes('correct answer:')) {
        correctAnswer = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('explanation:')) {
        explanation = line.split(':')[1]?.trim() || '';
      }
    }

    if (question) {
      questions.push({
        question,
        options: options.length > 0 ? options : undefined,
        correctAnswer: correctAnswer || undefined,
        explanation: explanation || undefined,
      });
    }
  });

  return questions;
}
