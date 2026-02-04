export type Role = "learner" | "parent" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  subject?: string;
  gradeBand?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  orderIndex: number;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  difficulty: number;
  xpReward: number;
}

export interface MentorProfile {
  id: string;
  userId: string;
  bio?: string;
  expertiseTags: string[];
}

export interface MentorSession {
  id: string;
  learnerId: string;
  mentorId: string;
  status: "requested" | "scheduled" | "completed" | "cancelled";
  topic?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}
