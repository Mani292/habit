import { supabase } from './supabase';
import type {
  Habit,
  HabitFormData,
  HabitLog,
  HabitStreak,
  HabitWithStats,
  UserStats,
  Achievement,
  UserAchievement,
  AchievementWithStatus,
  Challenge,
  ChallengeFormData,
  ChallengeParticipant,
  ChallengeWithDetails,
  Reminder,
  Profile,
  DailyStats,
  WeeklyBreakdown,
} from '@/types/types';

// ============= Profile APIs =============
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateProfileRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

// ============= User Stats APIs =============
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
  const { error } = await supabase
    .from('user_stats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function addXP(userId: string, xp: number): Promise<void> {
  const stats = await getUserStats(userId);
  if (!stats) return;

  const newXP = stats.xp + xp;
  const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level

  await updateUserStats(userId, {
    xp: newXP,
    level: newLevel,
  });
}

// ============= Habit APIs =============
export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getHabit(habitId: string): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createHabit(userId: string, habitData: HabitFormData): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      ...habitData,
      color: habitData.color || '#10b981',
    })
    .select()
    .single();

  if (error) throw error;

  // Initialize streak for new habit
  await supabase.from('habit_streaks').insert({
    habit_id: data.id,
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
  });

  // Check for habit creation achievements
  await checkAchievements(userId);

  return data;
}

export async function updateHabit(habitId: string, updates: Partial<HabitFormData>): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', habitId);

  if (error) throw error;
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', habitId);

  if (error) throw error;
}

export async function getHabitsWithStats(userId: string, date: string): Promise<HabitWithStats[]> {
  const habits = await getHabits(userId);
  
  const habitsWithStats = await Promise.all(
    habits.map(async (habit) => {
      const [streak, todayLog] = await Promise.all([
        getHabitStreak(habit.id),
        getHabitLog(habit.id, date),
      ]);

      return {
        ...habit,
        streak: streak || undefined,
        today_log: todayLog || undefined,
      };
    })
  );

  return habitsWithStats;
}

// ============= Habit Log APIs =============
export async function getHabitLog(habitId: string, date: string): Promise<HabitLog | null> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('log_date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .order('log_date', { ascending: false });

  if (startDate) {
    query = query.gte('log_date', startDate);
  }
  if (endDate) {
    query = query.lte('log_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function logHabit(
  habitId: string,
  userId: string,
  date: string,
  completed: boolean,
  value?: number,
  notes?: string
): Promise<void> {
  // Upsert the log
  const { error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: userId,
      log_date: date,
      completed,
      value: value || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'habit_id,log_date',
    });

  if (error) throw error;

  // Update streak
  await updateStreak(habitId, userId, date, completed);

  // Award XP if completed
  if (completed) {
    await addXP(userId, 10); // 10 XP per habit completion
    
    // Update total habits completed
    const stats = await getUserStats(userId);
    if (stats) {
      await updateUserStats(userId, {
        total_habits_completed: stats.total_habits_completed + 1,
      });
    }

    // Check for achievements
    await checkAchievements(userId);
  }
}

export async function deleteHabitLog(habitId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('log_date', date);

  if (error) throw error;
}

// ============= Habit Streak APIs =============
export async function getHabitStreak(habitId: string): Promise<HabitStreak | null> {
  const { data, error } = await supabase
    .from('habit_streaks')
    .select('*')
    .eq('habit_id', habitId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function updateStreak(habitId: string, userId: string, date: string, completed: boolean): Promise<void> {
  const streak = await getHabitStreak(habitId);
  if (!streak) return;

  const today = new Date(date);
  const lastCompleted = streak.last_completed_date ? new Date(streak.last_completed_date) : null;

  let newStreak = streak.current_streak;

  if (completed) {
    if (!lastCompleted) {
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff === 0) {
        // Same day, keep streak
      } else {
        newStreak = 1; // Streak broken
      }
    }

    const newLongest = Math.max(newStreak, streak.longest_streak);

    await supabase
      .from('habit_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_date: date,
        updated_at: new Date().toISOString(),
      })
      .eq('habit_id', habitId);

    // Update user's current streak
    const stats = await getUserStats(userId);
    if (stats) {
      const userNewStreak = Math.max(newStreak, stats.current_streak);
      const userLongestStreak = Math.max(userNewStreak, stats.longest_streak);
      
      await updateUserStats(userId, {
        current_streak: userNewStreak,
        longest_streak: userLongestStreak,
      });
    }
  } else {
    // If uncompleting, recalculate streak
    if (lastCompleted && lastCompleted.toISOString().split('T')[0] === date) {
      await supabase
        .from('habit_streaks')
        .update({
          current_streak: Math.max(0, newStreak - 1),
          last_completed_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('habit_id', habitId);
    }
  }
}

// ============= Achievement APIs =============
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserAchievements(userId: string): Promise<AchievementWithStatus[]> {
  const [allAchievements, userAchievements, stats] = await Promise.all([
    getAchievements(),
    supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', userId),
    getUserStats(userId),
  ]);

  const earnedMap = new Map(
    (userAchievements.data || []).map((ua) => [ua.achievement_id, ua.earned_at])
  );

  return allAchievements.map((achievement) => {
    const earned = earnedMap.has(achievement.id);
    let progress = 0;

    if (!earned && stats) {
      switch (achievement.requirement_type) {
        case 'total_completed':
          progress = Math.min(100, (stats.total_habits_completed / achievement.requirement_value) * 100);
          break;
        case 'streak':
          progress = Math.min(100, (stats.longest_streak / achievement.requirement_value) * 100);
          break;
        case 'level':
          progress = Math.min(100, (stats.level / achievement.requirement_value) * 100);
          break;
      }
    }

    return {
      ...achievement,
      earned,
      earned_at: earnedMap.get(achievement.id),
      progress: earned ? 100 : progress,
    };
  });
}

async function checkAchievements(userId: string): Promise<void> {
  const [achievements, userAchievements, stats] = await Promise.all([
    getAchievements(),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
    getUserStats(userId),
  ]);

  if (!stats) return;

  const earnedIds = new Set((userAchievements.data || []).map((ua) => ua.achievement_id));

  // Get additional data for new achievement types
  const [habitsCount, challengesCreatedCount, challengesJoinedCount, activeHabitsCount] = await Promise.all([
    supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
    supabase.from('challenge_participants').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
  ]);

  const habitsCreated = habitsCount.count || 0;
  const challengesCreated = challengesCreatedCount.count || 0;
  const challengesJoined = challengesJoinedCount.count || 0;
  const activeHabits = activeHabitsCount.count || 0;

  for (const achievement of achievements) {
    if (earnedIds.has(achievement.id)) continue;

    let shouldEarn = false;

    switch (achievement.requirement_type) {
      case 'total_completed':
        shouldEarn = stats.total_habits_completed >= achievement.requirement_value;
        break;
      case 'streak':
        shouldEarn = stats.longest_streak >= achievement.requirement_value;
        break;
      case 'level':
        shouldEarn = stats.level >= achievement.requirement_value;
        break;
      case 'habits_created':
        shouldEarn = habitsCreated >= achievement.requirement_value;
        break;
      case 'challenges_created':
        shouldEarn = challengesCreated >= achievement.requirement_value;
        break;
      case 'challenges_joined':
        shouldEarn = challengesJoined >= achievement.requirement_value;
        break;
      case 'xp':
        shouldEarn = stats.xp >= achievement.requirement_value;
        break;
      case 'active_habits':
        shouldEarn = activeHabits >= achievement.requirement_value;
        break;
      // Note: perfect_days, early_completions, and comebacks require more complex tracking
      // These will be implemented in future updates with dedicated tracking tables
      case 'perfect_days':
      case 'early_completions':
      case 'comebacks':
        // Skip for now - requires additional tracking logic
        break;
    }

    if (shouldEarn) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // Award XP
      await addXP(userId, achievement.xp_reward);
    }
  }
}

// ============= Challenge APIs =============
export async function getChallenges(): Promise<ChallengeWithDetails[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      profiles!challenges_creator_id_fkey(username)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const challenges = Array.isArray(data) ? data : [];

  // Get participant counts
  const challengesWithDetails = await Promise.all(
    challenges.map(async (challenge) => {
      const { count } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challenge.id);

      return {
        ...challenge,
        participant_count: count || 0,
        creator_username: challenge.profiles?.username,
      };
    })
  );

  return challengesWithDetails;
}

export async function getChallenge(challengeId: string): Promise<ChallengeWithDetails | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      profiles!challenges_creator_id_fkey(username)
    `)
    .eq('id', challengeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { count } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId);

  return {
    ...data,
    participant_count: count || 0,
    creator_username: data.profiles?.username,
  };
}

export async function createChallenge(userId: string, challengeData: ChallengeFormData): Promise<Challenge> {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      creator_id: userId,
      ...challengeData,
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-join creator
  await joinChallenge(data.id, userId);

  // Check for challenge creation achievements
  await checkAchievements(userId);

  return data;
}

export async function joinChallenge(challengeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      days_completed: 0,
    });

  if (error) throw error;

  // Check for challenge joining achievements
  await checkAchievements(userId);
}

export async function leaveChallenge(challengeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('days_completed', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserChallenges(userId: string): Promise<ChallengeWithDetails[]> {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenges!inner(
        *,
        profiles!challenges_creator_id_fkey(username)
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;

  const participations = Array.isArray(data) ? data : [];

  return participations.map((p) => ({
    ...p.challenges,
    user_participation: p,
    creator_username: p.challenges.profiles?.username,
  }));
}

// ============= Reminder APIs =============
export async function getReminders(habitId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('habit_id', habitId)
    .order('reminder_time', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createReminder(habitId: string, userId: string, reminderTime: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      habit_id: habitId,
      user_id: userId,
      reminder_time: reminderTime,
      enabled: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', reminderId);

  if (error) throw error;
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);

  if (error) throw error;
}

// ============= Analytics APIs =============
export async function getDailyStats(userId: string, startDate: string, endDate: string): Promise<DailyStats[]> {
  const habits = await getHabits(userId);
  const habitIds = habits.map((h) => h.id);

  if (habitIds.length === 0) return [];

  const { data, error } = await supabase
    .from('habit_logs')
    .select('log_date, completed')
    .in('habit_id', habitIds)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error) throw error;

  const logs = Array.isArray(data) ? data : [];
  const statsByDate = new Map<string, { completed: number; total: number }>();

  logs.forEach((log) => {
    const existing = statsByDate.get(log.log_date) || { completed: 0, total: 0 };
    statsByDate.set(log.log_date, {
      completed: existing.completed + (log.completed ? 1 : 0),
      total: existing.total + 1,
    });
  });

  return Array.from(statsByDate.entries()).map(([date, stats]) => ({
    date,
    completed: stats.completed,
    total: stats.total,
    completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
  }));
}

export async function getWeeklyBreakdown(userId: string): Promise<WeeklyBreakdown[]> {
  const habits = await getHabits(userId);
  const habitIds = habits.map((h) => h.id);

  if (habitIds.length === 0) return [];

  // Get last 90 days of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const { data, error } = await supabase
    .from('habit_logs')
    .select('log_date, completed')
    .in('habit_id', habitIds)
    .gte('log_date', startDate.toISOString().split('T')[0])
    .lte('log_date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  const logs = Array.isArray(data) ? data : [];
  const dayStats = new Map<number, { completed: number; total: number }>();

  logs.forEach((log) => {
    const dayOfWeek = new Date(log.log_date).getDay();
    const existing = dayStats.get(dayOfWeek) || { completed: 0, total: 0 };
    dayStats.set(dayOfWeek, {
      completed: existing.completed + (log.completed ? 1 : 0),
      total: existing.total + 1,
    });
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return dayNames.map((name, index) => {
    const stats = dayStats.get(index) || { completed: 0, total: 0 };
    return {
      day_name: name,
      day_number: index,
      completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      total_habits: stats.total,
    };
  });
}
