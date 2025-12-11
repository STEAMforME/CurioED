import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Student, Educator } from '../types/database';

type UserRole = 'student' | 'educator' | null;

interface AuthContextType {
  user: User | null;
  profile: Student | Educator | null;
  role: UserRole;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: 'student' | 'educator',
    firstName: string,
    lastName: string,
    additionalData?: { grade?: number; school?: string }
  ) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Student> | Partial<Educator>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Student | Educator | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try student first
      const { data: studentData, error: studentError } = await supabase
        .from('curioed_students')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (studentData && !studentError) {
        setProfile(studentData);
        setRole('student');
        setLoading(false);
        return;
      }

      // Try educator
      const { data: educatorData, error: educatorError } = await supabase
        .from('curioed_educators')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (educatorData && !educatorError) {
        setProfile(educatorData);
        setRole('educator');
        setLoading(false);
        return;
      }

      // No profile found
      console.error('No profile found for user');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'student' | 'educator',
    firstName: string,
    lastName: string,
    additionalData?: { grade?: number; school?: string }
  ) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };
      if (!data.user) return { error: new Error('User creation failed') as AuthError };

      // Create role-specific profile
      if (role === 'student') {
        const { error: profileError } = await supabase.from('curioed_students').insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          grade: additionalData?.grade || null,
        });

        if (profileError) throw profileError;
      } else if (role === 'educator') {
        const { error: profileError } = await supabase.from('curioed_educators').insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          school: additionalData?.school || null,
        });

        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const updateProfile = async (data: Partial<Student> | Partial<Educator>) => {
    if (!user || !role) return { error: new Error('Not authenticated') };

    try {
      const table = role === 'student' ? 'curioed_students' : 'curioed_educators';
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
