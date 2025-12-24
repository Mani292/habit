import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Calendar, Target, Trophy } from 'lucide-react';
import { getChallenges, getUserChallenges, createChallenge, joinChallenge, leaveChallenge } from '@/db/api';
import type { ChallengeWithDetails, ChallengeFormData } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ChallengesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allChallenges, setAllChallenges] = useState<ChallengeWithDetails[]>([]);
  const [myChallenges, setMyChallenges] = useState<ChallengeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ChallengeFormData>({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    habit_name: '',
    target_days: 7,
    is_public: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;

    try {
      const [all, mine] = await Promise.all([
        getChallenges(),
        getUserChallenges(user.id),
      ]);

      setAllChallenges(all);
      setMyChallenges(mine);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenges. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      await createChallenge(user.id, formData);
      toast({
        title: 'Challenge created!',
        description: 'Your challenge has been created successfully.',
      });
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        habit_name: '',
        target_days: 7,
        is_public: true,
      });
      await loadChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create challenge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await joinChallenge(challengeId, user.id);
      toast({
        title: 'Joined challenge!',
        description: 'You have successfully joined the challenge.',
      });
      await loadChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to join challenge. You may already be a participant.',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await leaveChallenge(challengeId, user.id);
      toast({
        title: 'Left challenge',
        description: 'You have left the challenge.',
      });
      await loadChallenges();
    } catch (error) {
      console.error('Error leaving challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave challenge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isParticipating = (challengeId: string) => {
    return myChallenges.some((c) => c.id === challengeId);
  };

  const getChallengeStatus = (challenge: ChallengeWithDetails) => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'active':
        return <Badge className="bg-success">Active</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      default:
        return null;
    }
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
      <div className="container mx-auto p-4 xl:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold">Challenges</h1>
            <p className="text-muted-foreground mt-1">
              Join group challenges and stay accountable
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateChallenge}>
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                  <DialogDescription>
                    Create a challenge for yourself and others to join
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Challenge Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., 30-Day Reading Challenge"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the challenge..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      disabled={submitting}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="habit_name">Habit Name *</Label>
                    <Input
                      id="habit_name"
                      placeholder="e.g., Read 10 pages"
                      value={formData.habit_name}
                      onChange={(e) => setFormData({ ...formData, habit_name: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_days">Target Days *</Label>
                    <Input
                      id="target_days"
                      type="number"
                      min="1"
                      placeholder="e.g., 7"
                      value={formData.target_days}
                      onChange={(e) => setFormData({ ...formData, target_days: parseInt(e.target.value) || 1 })}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Challenge'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="mine">My Challenges ({myChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Be the first to create a challenge!
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {allChallenges.map((challenge) => {
                  const status = getChallengeStatus(challenge);
                  const participating = isParticipating(challenge.id);

                  return (
                    <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{challenge.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {challenge.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{challenge.habit_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(challenge.start_date).toLocaleDateString()} -{' '}
                              {new Date(challenge.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{challenge.participant_count} participant{challenge.participant_count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="h-4 w-4" />
                            <span>Target: {challenge.target_days} days</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          {participating ? (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleLeaveChallenge(challenge.id)}
                            >
                              Leave Challenge
                            </Button>
                          ) : (
                            <Button
                              className="w-full"
                              onClick={() => handleJoinChallenge(challenge.id)}
                              disabled={status === 'ended'}
                            >
                              Join Challenge
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine" className="space-y-4">
            {myChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No challenges joined</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Join a challenge to stay motivated with others!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {myChallenges.map((challenge) => {
                  const status = getChallengeStatus(challenge);
                  const progress = challenge.user_participation
                    ? Math.round((challenge.user_participation.days_completed / challenge.target_days) * 100)
                    : 0;

                  return (
                    <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{challenge.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {challenge.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Your Progress</span>
                            <span className="font-medium">
                              {challenge.user_participation?.days_completed || 0} / {challenge.target_days} days
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-success h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{challenge.habit_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{challenge.participant_count} participant{challenge.participant_count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleLeaveChallenge(challenge.id)}
                        >
                          Leave Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
