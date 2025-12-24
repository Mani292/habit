// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type RecordingType = 'check' | 'counter' | 'duration';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  total_habits_completed: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  custom_days: number[] | null;
  recording_type: RecordingType;
  target_value: number | null;
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitStreak {
  id: string;
  habit_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  start_date: string;
  end_date: string;
  habit_name: string;
  target_days: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  days_completed: number;
  joined_at: string;
}

export interface Reminder {
  id: string;
  habit_id: string;
  user_id: string;
  reminder_time: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface HabitWithStats extends Habit {
  streak?: HabitStreak;
  today_log?: HabitLog;
  completion_rate?: number;
}

export interface ChallengeWithDetails extends Challenge {
  participant_count?: number;
  user_participation?: ChallengeParticipant;
  creator_username?: string;
}

export interface AchievementWithStatus extends Achievement {
  earned?: boolean;
  earned_at?: string;
  progress?: number;
}

// Form types
export interface HabitFormData {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  custom_days?: number[];
  recording_type: RecordingType;
  target_value?: number;
  color?: string;
  icon?: string;
}

export interface ChallengeFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  habit_name: string;
  target_days: number;
  is_public: boolean;
}

// Analytics types
export interface DailyStats {
  date: string;
  completed: number;
  total: number;
  completion_rate: number;
}

export interface WeeklyBreakdown {
  day_name: string;
  day_number: number;
  completion_rate: number;
  total_habits: number;
}

export interface TrendData {
  period: string;
  value: number;
  label: string;
}
