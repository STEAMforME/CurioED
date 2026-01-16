/**
 * CRAFTFuture API Client
 * Connects CurioED frontend to Nova Byte AI backend
 * Handles quiz generation, Socratic chat, and RAG search
 */

const CRAFT_API_URL = import.meta.env.VITE_CRAFT_API_URL || 'http://localhost:8000';

export interface QuizQuestion {
  question: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
}

export interface QuizResult {
  success: boolean;
  topic?: string;
  grade_level?: number;
  num_questions?: number;
  quiz_content?: string;
  questions?: QuizQuestion[];
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResult {
  success: boolean;
  response?: string;
  sources?: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
  error?: string;
}

export interface SearchResult {
  success: boolean;
  results?: Array<{
    content: string;
    score: number;
    category?: string;
    metadata?: Record<string, any>;
  }>;
  error?: string;
}

/**
 * Generate educational quiz using Nova Byte
 * @param topic - Quiz topic (e.g., "robotics basics")
 * @param grade - Student grade level (1-12)
 * @param numQuestions - Number of questions to generate (default: 5)
 * @returns Quiz with questions and answers
 */
export async function generateQuiz(
  topic: string,
  grade: number,
  numQuestions: number = 5
): Promise<QuizResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

    const response = await fetch(
      `${CRAFT_API_URL}/generate-quiz?topic=${encodeURIComponent(topic)}&grade=${grade}&num_questions=${numQuestions}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Quiz generation timed out. Please try again with a simpler topic.',
        };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

/**
 * Chat with Nova Byte using RAG (Retrieval-Augmented Generation)
 * Provides Socratic questioning and learning support
 * @param query - Student's question or prompt
 * @param context - Optional conversation context
 * @returns AI response with sources
 */
export async function chatWithNovaByte(
  query: string,
  context?: string
): Promise<ChatResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch(`${CRAFT_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Response timed out. Please try a shorter question.',
        };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

/**
 * Search across all CRAFT knowledge collections
 * Includes grants, curriculum, research, and code
 * @param query - Search query
 * @param limit - Maximum results to return (default: 3)
 * @returns Search results with scores
 */
export async function searchKnowledge(
  query: string,
  limit: number = 3
): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${CRAFT_API_URL}/search-all?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

/**
 * Check API health status
 * @returns Health status and available models
 */
export async function checkHealth(): Promise<{
  status: string;
  models?: string[];
  error?: string;
}> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/health`);
    if (!response.ok) {
      throw new Error('API not responding');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
