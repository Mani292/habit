import { MainLayout } from '@/components/layouts/MainLayout';
import { HabitForm } from '@/components/habits/HabitForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NewHabitPage() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl xl:text-4xl font-bold">Create New Habit</h1>
          <p className="text-muted-foreground mt-2">
            Define a new habit to track and build consistency
          </p>
        </div>

        <HabitForm />
      </div>
    </MainLayout>
  );
}
