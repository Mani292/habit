import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUserAchievements } from '@/db/api';
import type { AchievementWithStatus } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      const data = await getUserAchievements(user.id);
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalXP = achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + a.xp_reward, 0);

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
          <h1 className="text-3xl xl:text-4xl font-bold">Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Unlock badges and earn rewards for your progress
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnedCount} / {achievements.length}
              </div>
              <Progress
                value={(earnedCount / achievements.length) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP Earned</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalXP} XP</div>
              <p className="text-xs text-muted-foreground mt-2">
                From achievements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((earnedCount / achievements.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keep going!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">All Achievements</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={cn(
                  'transition-all',
                  achievement.earned
                    ? 'border-success bg-success/5'
                    : 'opacity-75'
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          'text-4xl p-3 rounded-lg',
                          achievement.earned
                            ? 'bg-success/20'
                            : 'bg-muted grayscale'
                        )}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {achievement.name}
                          {achievement.earned && (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                          {!achievement.earned && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={achievement.earned ? 'default' : 'secondary'}
                      className={cn(
                        'shrink-0',
                        achievement.earned && 'bg-success hover:bg-success/90'
                      )}
                    >
                      +{achievement.xp_reward} XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {achievement.earned ? (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">
                        Unlocked on{' '}
                        {achievement.earned_at &&
                          new Date(achievement.earned_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {Math.round(achievement.progress || 0)}%
                        </span>
                      </div>
                      <Progress value={achievement.progress || 0} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Motivation Section */}
        {earnedCount < achievements.length && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Trophy className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keep Building Your Habits!</h3>
              <p className="text-muted-foreground max-w-md">
                You're {achievements.length - earnedCount} achievement{achievements.length - earnedCount !== 1 ? 's' : ''} away from completing your collection. 
                Stay consistent and watch your progress grow!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
