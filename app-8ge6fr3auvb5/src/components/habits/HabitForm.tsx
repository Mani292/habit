import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { createHabit, updateHabit } from '@/db/api';
import type { Habit, HabitFormData } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
}

const HABIT_ICONS = ['🎯', '📚', '💪', '🏃', '🧘', '💧', '🥗', '😴', '✍️', '🎨', '🎵', '🌱'];
const HABIT_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<HabitFormData>({
    name: habit?.name || '',
    description: habit?.description || '',
    frequency: habit?.frequency || 'daily',
    custom_days: habit?.custom_days || [],
    recording_type: habit?.recording_type || 'check',
    target_value: habit?.target_value || undefined,
    color: habit?.color || '#10b981',
    icon: habit?.icon || '🎯',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (habit) {
        await updateHabit(habit.id, formData);
        toast({
          title: 'Habit updated!',
          description: 'Your habit has been successfully updated.',
        });
      } else {
        await createHabit(user.id, formData);
        toast({
          title: 'Habit created!',
          description: 'Your new habit has been added.',
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/habits');
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to save habit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDayToggle = (dayIndex: number) => {
    const currentDays = formData.custom_days || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter((d) => d !== dayIndex)
      : [...currentDays, dayIndex].sort((a, b) => a - b);
    
    setFormData({ ...formData, custom_days: newDays });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define your habit's name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Read 10 pages"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your habit..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose an icon and color for your habit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 xl:grid-cols-12 gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 xl:grid-cols-8 gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.color === color
                      ? 'border-foreground'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequency</CardTitle>
          <CardDescription>How often do you want to do this habit?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency Type</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'custom') =>
                setFormData({ ...formData, frequency: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === 'custom' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {DAY_NAMES.map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={(formData.custom_days || []).includes(index)}
                      onCheckedChange={() => handleCustomDayToggle(index)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`day-${index}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Type</CardTitle>
          <CardDescription>How do you want to track this habit?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recording_type">Recording Type</Label>
            <Select
              value={formData.recording_type}
              onValueChange={(value: 'check' | 'counter' | 'duration') =>
                setFormData({ ...formData, recording_type: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="recording_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check">Simple Check-off</SelectItem>
                <SelectItem value="counter">Counter (e.g., pages read)</SelectItem>
                <SelectItem value="duration">Duration (minutes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.recording_type === 'counter' || formData.recording_type === 'duration') && (
            <div className="space-y-2">
              <Label htmlFor="target_value">
                Target {formData.recording_type === 'counter' ? 'Count' : 'Minutes'}
              </Label>
              <Input
                id="target_value"
                type="number"
                min="1"
                placeholder={formData.recording_type === 'counter' ? 'e.g., 10' : 'e.g., 30'}
                value={formData.target_value || ''}
                onChange={(e) =>
                  setFormData({ ...formData, target_value: parseInt(e.target.value) || undefined })
                }
                disabled={loading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/habits')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
