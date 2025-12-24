import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Check, Flame, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHabitsWithStats, getUserStats, logHabit } from '@/db/api';
import type { HabitWithStats, UserStats } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [habitsData, statsData] = await Promise.all([
        getHabitsWithStats(user.id, today),
        getUserStats(user.id),
      ]);

      setHabits(habitsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load habits. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId: string, currentStatus: boolean) => {
    if (!user || togglingHabit) return;

    setTogglingHabit(habitId);

    try {
      await logHabit(habitId, user.id, today, !currentStatus);
      
      toast({
        title: !currentStatus ? '✓ Habit completed!' : 'Habit unchecked',
        description: !currentStatus ? 'Great job! Keep up the momentum.' : 'Habit marked as incomplete.',
      });

      await loadData();
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTogglingHabit(null);
    }
  };

  const getTodayCompletion = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter((h) => h.today_log?.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getCompletedCount = () => {
    return habits.filter((h) => h.today_log?.completed).length;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-6 xl:p-8 space-y-4 md:space-y-6 xl:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button onClick={() => navigate('/habits/new')} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            New Habit
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCompletedCount()} / {habits.length}</div>
              <Progress value={getTodayCompletion()} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {getTodayCompletion()}% completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0} days</div>
              <p className="text-xs text-muted-foreground mt-2">
                Longest: {stats?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_habits_completed || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                All time habits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level & XP</CardTitle>
              <Badge variant="secondary" className="text-sm">
                Level {stats?.level || 1}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.xp || 0} XP</div>
              <Progress 
                value={((stats?.xp || 0) % 100)} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {100 - ((stats?.xp || 0) % 100)} XP to next level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Habits */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Today's Habits</h2>
            {habits.length > 0 && (
              <Badge variant="outline" className="text-xs md:text-sm">
                {getCompletedCount()} / {habits.length} completed
              </Badge>
            )}
          </div>

          {habits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                <Target className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">No habits yet</h3>
                <p className="text-sm md:text-base text-muted-foreground text-center mb-4 md:mb-6 px-4">
                  Start building better habits by creating your first one!
                </p>
                <Button onClick={() => navigate('/habits/new')} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {habits.map((habit) => {
                const isCompleted = habit.today_log?.completed || false;
                const isToggling = togglingHabit === habit.id;

                return (
                  <Card
                    key={habit.id}
                    className={cn(
                      'transition-all duration-300 hover:shadow-md cursor-pointer',
                      isCompleted && 'border-success bg-success/5'
                    )}
                    onClick={() => !isToggling && handleToggleHabit(habit.id, isCompleted)}
                  >
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            {habit.icon && <span className="text-xl md:text-2xl">{habit.icon}</span>}
                            <span className={cn('truncate', isCompleted && 'line-through text-muted-foreground')}>
                              {habit.name}
                            </span>
                          </CardTitle>
                          {habit.description && (
                            <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">
                              {habit.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant={isCompleted ? 'default' : 'outline'}
                          className={cn(
                            'shrink-0 transition-all h-9 w-9 md:h-10 md:w-10',
                            isCompleted && 'bg-success hover:bg-success/90'
                          )}
                          disabled={isToggling}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHabit(habit.id, isCompleted);
                          }}
                        >
                          {isToggling ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Check className={cn('h-4 w-4 md:h-5 md:w-5', isCompleted && 'text-white')} />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 md:h-4 md:w-4 text-warning" />
                          <span className="font-medium">{habit.streak?.current_streak || 0}</span>
                          <span className="text-muted-foreground">day streak</span>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {habit.frequency}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
