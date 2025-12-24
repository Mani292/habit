import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import HabitsPage from './pages/HabitsPage';
import NewHabitPage from './pages/NewHabitPage';
import EditHabitPage from './pages/EditHabitPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import ChallengesPage from './pages/ChallengesPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <DashboardPage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false
  },
  {
    name: 'Habits',
    path: '/habits',
    element: <HabitsPage />
  },
  {
    name: 'New Habit',
    path: '/habits/new',
    element: <NewHabitPage />,
    visible: false
  },
  {
    name: 'Edit Habit',
    path: '/habits/:id/edit',
    element: <EditHabitPage />,
    visible: false
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <AnalyticsPage />
  },
  {
    name: 'Achievements',
    path: '/achievements',
    element: <AchievementsPage />
  },
  {
    name: 'Challenges',
    path: '/challenges',
    element: <ChallengesPage />
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <SettingsPage />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
    visible: false
  }
];

export default routes;
