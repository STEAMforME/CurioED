// CurioED Database Types
// Auto-generated types for Supabase tables

export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  grade?: number;
  avatar_url?: string;
  preferences: {
    notifications?: boolean;
    theme?: 'light' | 'dark';
  };
  created_at: string;
  updated_at: string;
}

export interface Educator {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  school?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: 'academic' | 'personal' | 'career' | 'skill';
  target_date?: string;
  progress: number; // 0-100
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalUpdate {
  id: string;
  goal_id: string;
  progress: number;
  note?: string;
  updated_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  week_of: string; // ISO date
  craft_element?: 'curiosity' | 'reflection' | 'agency' | 'framework' | 'transformation';
  mood?: 'excited' | 'confident' | 'neutral' | 'frustrated' | 'confused';
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  project_type: 'stem' | 'art' | 'writing' | 'research' | 'maker' | 'other';
  status: 'planning' | 'in_progress' | 'completed' | 'presented';
  image_url?: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  craft_tags: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
  category: 'goals' | 'reflections' | 'projects' | 'engagement' | 'craft';
  craft_element?: 'curiosity' | 'reflection' | 'agency' | 'framework' | 'transformation';
  criteria: {
    type: string;
    threshold?: number;
    [key: string]: any;
  };
  points: number;
  created_at: string;
}

export interface StudentBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // Joined data
}

export interface Assignment {
  educator_id: string;
  student_id: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'goal_created' | 'goal_completed' | 'reflection_submitted' | 'project_created' | 'project_completed' | 'badge_earned';
  metadata: Record<string, any>;
  occurred_at: string;
}

// Helper types for queries
export interface StudentWithProgress extends Student {
  total_goals: number;
  completed_goals: number;
  total_reflections: number;
  total_projects: number;
  total_badges: number;
  last_activity?: string;
}

export interface EducatorDashboardStats {
  total_students: number;
  active_students_week: number;
  at_risk_students: number;
  total_reflections_week: number;
  total_goals_completed_week: number;
}

// Database query result types
export type DbResult<T> = T | null;
export type DbResultArray<T> = T[];
