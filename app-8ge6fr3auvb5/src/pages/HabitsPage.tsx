import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Flame, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHabits, deleteHabit } from '@/db/api';
import type { Habit } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function HabitsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits();
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;

    try {
      const data = await getHabits(user.id);
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load habits. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;

    try {
      await deleteHabit(habitToDelete.id);
      toast({
        title: 'Habit deleted',
        description: 'The habit has been successfully removed.',
      });
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    }
  };

  const getFrequencyDisplay = (habit: Habit) => {
    if (habit.frequency === 'custom' && habit.custom_days) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return habit.custom_days.map((d) => dayNames[d]).join(', ');
    }
    return habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1);
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
            <h1 className="text-3xl xl:text-4xl font-bold">My Habits</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your habits
            </p>
          </div>
          <Button onClick={() => navigate('/habits/new')} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Habit
          </Button>
        </div>

        {habits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first habit to start tracking your progress
              </p>
              <Button onClick={() => navigate('/habits/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {habit.icon && <span className="text-2xl">{habit.icon}</span>}
                        {habit.name}
                      </CardTitle>
                      {habit.description && (
                        <CardDescription className="mt-2">
                          {habit.description}
                        </CardDescription>
                      )}
                    </div>
                    <div
                      className="w-4 h-4 rounded-full shrink-0 ml-2"
                      style={{ backgroundColor: habit.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        <Calendar className="mr-1 h-3 w-3" />
                        {getFrequencyDisplay(habit)}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {habit.recording_type}
                        {habit.target_value && ` (${habit.target_value})`}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/habits/${habit.id}/edit`)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(habit)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{habitToDelete?.name}"? This action cannot be undone
                and all associated data will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
