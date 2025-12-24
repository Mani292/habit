import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDailyStats, getWeeklyBreakdown, getHabits, getUserStats } from '@/db/api';
import type { DailyStats, WeeklyBreakdown, UserStats } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeeklyBreakdown[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [habitCount, setHabitCount] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [daily, weekly, stats, habits] = await Promise.all([
        getDailyStats(
          user.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        getWeeklyBreakdown(user.id),
        getUserStats(user.id),
        getHabits(user.id),
      ]);

      setDailyStats(daily);
      setWeeklyBreakdown(weekly);
      setUserStats(stats);
      setHabitCount(habits.length);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionTrend = () => {
    return dailyStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: Math.round(stat.completion_rate),
      completed: stat.completed,
      total: stat.total,
    }));
  };

  const getWeekdayData = () => {
    return weeklyBreakdown.map((day) => ({
      day: day.day_name.substring(0, 3),
      rate: Math.round(day.completion_rate),
    }));
  };

  const getOverallCompletion = () => {
    if (dailyStats.length === 0) return 0;
    const totalRate = dailyStats.reduce((sum, stat) => sum + stat.completion_rate, 0);
    return Math.round(totalRate / dailyStats.length);
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

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
      <div className="container mx-auto p-4 xl:p-8 space-y-6">
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and identify patterns
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habitCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active habits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOverallCompletion()}%</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {userStats?.level || 1}</div>
              <p className="text-xs text-muted-foreground mt-1">{userStats?.xp || 0} XP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.longest_streak || 0} days</div>
              <p className="text-xs text-muted-foreground mt-1">Personal best</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend">Completion Trend</TabsTrigger>
            <TabsTrigger value="weekday">Weekday Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Completion Trend</CardTitle>
                <CardDescription>
                  Your daily habit completion rate over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available yet. Start tracking habits to see your progress!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getCompletionTrend()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Completion Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekday" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekday Performance</CardTitle>
                <CardDescription>
                  Which days of the week are you most consistent?
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available yet. Start tracking habits to see your patterns!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWeekdayData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      />
                      <Bar 
                        dataKey="rate" 
                        fill="hsl(var(--chart-2))"
                        radius={[8, 8, 0, 0]}
                        name="Completion Rate (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>
              Based on your habit tracking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyBreakdown.length > 0 && (
              <>
                {(() => {
                  const bestDay = weeklyBreakdown.reduce((prev, current) =>
                    current.completion_rate > prev.completion_rate ? current : prev
                  );
                  const worstDay = weeklyBreakdown.reduce((prev, current) =>
                    current.completion_rate < prev.completion_rate ? current : prev
                  );

                  return (
                    <>
                      <div className="flex items-start gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                        <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <p className="font-medium text-success">Best Performance Day</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            You're most consistent on {bestDay.day_name}s with a {Math.round(bestDay.completion_rate)}% completion rate.
                          </p>
                        </div>
                      </div>

                      {worstDay.completion_rate < 50 && (
                        <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
                          <Target className="h-5 w-5 text-warning mt-0.5" />
                          <div>
                            <p className="font-medium text-warning">Room for Improvement</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {worstDay.day_name}s show lower completion rates ({Math.round(worstDay.completion_rate)}%). 
                              Consider setting reminders or reducing habit load on this day.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}

            {userStats && userStats.current_streak >= 7 && (
              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Award className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Great Momentum!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're on a {userStats.current_streak}-day streak! Keep it going to reach your longest streak of {userStats.longest_streak} days.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
