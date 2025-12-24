import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HabitForm } from '@/components/habits/HabitForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getHabit } from '@/db/api';
import type { Habit } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function EditHabitPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabit();
  }, [id]);

  const loadHabit = async () => {
    if (!id) return;

    try {
      const data = await getHabit(id);
      if (data) {
        setHabit(data);
      } else {
        toast({
          title: 'Habit not found',
          description: 'The habit you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/habits');
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load habit. Please try again.',
        variant: 'destructive',
      });
      navigate('/habits');
    } finally {
      setLoading(false);
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

  if (!habit) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 xl:p-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/habits')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Habits
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl xl:text-4xl font-bold">Edit Habit</h1>
          <p className="text-muted-foreground mt-2">
            Update your habit details
          </p>
        </div>

        <HabitForm habit={habit} onSuccess={() => navigate('/habits')} />
      </div>
    </MainLayout>
  );
}
