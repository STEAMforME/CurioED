import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

// Define role types for the CRAFT platform
export type RoleType = 
  | 'learner'
  | 'parent'
  | 'mentor'
  | 'instructor'
  | 'principal'
  | 'superintendent'
  | 'admin';

// Learning path types
export type LearningPathType = 
  | 'academic'
  | 'career'
  | 'creative'
  | 'technical';

// CRAFT Module Types
export type CRAFTModule = 
  | 'curioed'      // Original CurioED platform
  | 'mentor'       // MentorConnect functionality
  | 'quest'        // QuestCraft gamification
  | 'edulearn';    // EduLearn content

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  avatar?: string;
  learningPaths?: LearningPathType[];
  activeModules?: CRAFTModule[];
  achievements?: Achievement[];
  progress?: ProgressData;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  module: CRAFTModule;
}

interface ProgressData {
  totalXP: number;
  level: number;
  completedQuests: number;
  coursesInProgress: number;
  mentoringSessions: number;
}

interface CRAFTContextType {
  user: User | null;
  userProfile: UserProfile | null;
  activeModule: CRAFTModule;
  setActiveModule: (module: CRAFTModule) => void;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addAchievement: (achievement: Achievement) => void;
  updateProgress: (progress: Partial<ProgressData>) => void;
}

const CRAFTContext = createContext<CRAFTContextType | undefined>(undefined);

interface CRAFTProviderProps {
  children: ReactNode;
}

export const CRAFTProvider: React.FC<CRAFTProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<CRAFTModule>('curioed');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize user profile from auth context or Supabase
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        // TODO: Fetch user profile from Supabase
        // This will integrate with AuthContext
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // TODO: Update profile in Supabase
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const addAchievement = (achievement: Achievement) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        achievements: [...(prev.achievements || []), achievement]
      };
    });
  };

  const updateProgress = (progress: Partial<ProgressData>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progress: { ...(prev.progress || {} as ProgressData), ...progress }
      };
    });
  };

  const value: CRAFTContextType = {
    user,
    userProfile,
    activeModule,
    setActiveModule,
    isLoading,
    error,
    updateProfile,
    addAchievement,
    updateProgress
  };

  return <CRAFTContext.Provider value={value}>{children}</CRAFTContext.Provider>;
};

export const useCRAFT = (): CRAFTContextType => {
  const context = useContext(CRAFTContext);
  if (!context) {
    throw new Error('useCRAFT must be used within a CRAFTProvider');
  }
  return context;
};
