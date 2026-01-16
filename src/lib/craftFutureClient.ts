// CRAFTFuture API Client
// Connects CurioED frontend to local Ollama-powered backend

const CRAFT_API_URL = import.meta.env.VITE_CRAFT_API_URL || 'http://localhost:8000';

export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
}

export interface QuizResponse {
  success: boolean;
  topic?: string;
  grade_level?: number;
  num_questions?: number;
  quiz_content?: string;
  questions?: QuizQuestion[];
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sources?: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
  error?: string;
}

export interface RAGSearchResponse {
  success: boolean;
  results?: Array<{
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  error?: string;
}

/**
 * Generate educational quiz using Nova Byte
 * @param topic - Quiz topic (e.g., "robotics basics", "photosynthesis")
 * @param gradeLevel - Student grade level (1-12)
 * @param numQuestions - Number of questions to generate
 * @param questionType - Type of questions
 */
export async function generateQuiz(
  topic: string,
  gradeLevel: number,
  numQuestions: number = 5,
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' = 'multiple_choice'
): Promise<QuizResponse> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        grade_level: gradeLevel,
        num_questions: numQuestions,
        question_type: questionType,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Quiz generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate quiz',
    };
  }
}

/**
 * Socratic chat with Nova Byte using RAG
 * @param question - Student question
 * @param context - Optional conversation context
 */
export async function askNovaByte(
  question: string,
  context?: string[]
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        context: context || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get response',
    };
  }
}

/**
 * Search across all CRAFT knowledge bases
 * @param query - Search query
 * @param limit - Max results to return
 */
export async function searchKnowledge(
  query: string,
  limit: number = 5
): Promise<RAGSearchResponse> {
  try {
    const response = await fetch(
      `${CRAFT_API_URL}/search-all?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search',
    };
  }
}

/**
 * Health check for CRAFT API
 */
export async function checkAPIHealth(): Promise<{ healthy: boolean; models?: string[] }> {
  try {
    const response = await fetch(`${CRAFT_API_URL}/health`);
    if (!response.ok) {
      return { healthy: false };
    }
    const data = await response.json();
    return { healthy: data.status === 'healthy', models: data.models };
  } catch (error) {
    console.error('Health check error:', error);
    return { healthy: false };
  }
}
