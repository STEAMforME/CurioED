/**
 * CRAFT Platform Type Definitions
 * 
 * Comprehensive types for the unified CRAFT the Future education platform
 * combining CurioED, MentorConnect, QuestCraft, and EduLearn
 */

// ============================================================================
// Core Platform Types
// ============================================================================

/**
 * Available modules in the CRAFT platform
 */
export type CRAFTModule = 
  | 'curioed'      // Core learning platform
  | 'mentor'       // Mentorship and connections
  | 'quest'        // Gamified quests and challenges
  | 'edulearn';    // Educational content library

/**
 * User roles across the platform
 */
export type RoleType = 
  | 'learner'           // Students/learners
  | 'parent'            // Parent/guardian
  | 'mentor'            // Mentors
  | 'instructor'        // Teachers/instructors
  | 'principal'         // School principals
  | 'superintendent'    // District superintendents
  | 'admin';            // Platform administrators

/**
 * Learning path categories
 */
export type LearningPathType = 
  | 'academic'     // Traditional academic subjects
  | 'career'       // Career and workforce development
  | 'creative'     // Arts and creative fields
  | 'technical';   // STEM and technical skills

// ============================================================================
// User & Profile Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  avatar?: string;
  bio?: string;
  location?: string;
  grade?: string;                    // For learners
  organization?: string;              // School/district name
  learningPaths?: LearningPathType[];
  activeModules?: CRAFTModule[];
  achievements?: Achievement[];
  progress?: ProgressData;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  notifications?: NotificationSettings;
  language?: string;
  timezone?: string;
  accessibility?: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  achievements: boolean;
  mentorMessages: boolean;
  questUpdates: boolean;
  courseUpdates: boolean;
}

export interface AccessibilitySettings {
  fontSize?: 'small' | 'medium' | 'large';
  highContrast?: boolean;
  screenReader?: boolean;
  reducedMotion?: boolean;
}

// ============================================================================
// Progress & Achievements
// ============================================================================

export interface ProgressData {
  totalXP: number;
  level: number;
  completedQuests: number;
  coursesInProgress: number;
  coursesCompleted: number;
  mentoringSessions: number;
  streakDays: number;
  lastActivityDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  earnedAt: Date;
  module: CRAFTModule;
}

export type AchievementCategory = 
  | 'learning'
  | 'social'
  | 'completion'
  | 'mastery'
  | 'streak'
  | 'special';

// ============================================================================
// Learning Content Types
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructor: UserProfile;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;              // in minutes
  modules: CourseModule[];
  enrollmentCount: number;
  rating: number;
  tags: string[];
  thumbnail?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
  estimatedTime: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  contentType: 'video' | 'text' | 'interactive' | 'quiz';
  url?: string;
  duration?: number;
  order: number;
  completed?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;            // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// ============================================================================
// Mentorship Types
// ============================================================================

export interface Mentor {
  id: string;
  userId: string;
  profile: UserProfile;
  expertise: string[];
  availability: Availability;
  bio: string;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  verified: boolean;
}

export interface Availability {
  daysAvailable: DayOfWeek[];
  timeSlots: TimeSlot[];
  timezone: string;
}

export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeSlot {
  start: string;                 // HH:MM format
  end: string;                   // HH:MM format
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: Date;
  duration: number;              // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  topic?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

// ============================================================================
// Quest/Gamification Types
// ============================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  xpReward: number;
  objectives: QuestObjective[];
  prerequisites?: string[];       // Quest IDs
  timeLimit?: number;            // in hours
  category: string;
  status: QuestStatus;
  startDate?: Date;
  endDate?: Date;
  participants: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;             // 0-100
  target?: number;
}

export type QuestStatus = 
  | 'available'
  | 'active'
  | 'completed'
  | 'expired'
  | 'locked';

// ============================================================================
// Activity & Analytics Types
// ============================================================================

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  module: CRAFTModule;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  xpEarned?: number;
  timestamp: Date;
}

export type ActivityType = 
  | 'course_started'
  | 'course_completed'
  | 'lesson_completed'
  | 'quiz_passed'
  | 'achievement_earned'
  | 'mentor_session'
  | 'quest_started'
  | 'quest_completed'
  | 'level_up'
  | 'streak_milestone';

export interface AnalyticsData {
  userId: string;
  dateRange: DateRange;
  metrics: {
    totalTimeSpent: number;      // in minutes
    lessonsCompleted: number;
    averageQuizScore: number;
    xpGained: number;
    streakDays: number;
    modulesAccessed: Record<CRAFTModule, number>;
  };
  topCategories: string[];
  recentActivities: Activity[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<Error>;
};

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, any>;
}
