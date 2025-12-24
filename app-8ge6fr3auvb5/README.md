# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-8ge6fr3auvb5

# Habit Tracker

A comprehensive habit tracking application that helps users build and maintain positive habits through customizable tracking, visual progress indicators, gamification, and social features.

## Features

### 🎯 Core Features
- **Email/Password Authentication**: Secure login with email and password
- **Persistent Sessions**: Stay logged in across browser sessions automatically
- **Mobile-Friendly Design**: Fully responsive interface optimized for all devices
- **Customizable Habits**: Define habits with specific details, frequencies (daily/weekly/custom days), and tracking types
- **Quick Check-off**: 1-click habit completion with immediate visual feedback
- **Streak Tracking**: Monitor consecutive completion days with visual indicators
- **Progress Visualization**: Color-coded calendar grids, completion percentages, and trend analysis

### 📊 Analytics & Insights
- **Detailed Analytics**: 30-day completion trends and weekly performance breakdowns
- **Pattern Recognition**: Identify best/worst performing days
- **Historical Data**: Complete habit completion history with day/week/month views
- **Visual Charts**: Line charts for trends, bar charts for weekday analysis

### 🎮 Gamification
- **XP & Leveling System**: Earn experience points for completing habits
- **Achievement Badges**: Unlock 40 diverse achievements across 11 categories
- **Progress Rewards**: Visual rewards and notifications for accomplishments
- **Level Progression**: 100 XP per level with progress tracking
- **Multiple Achievement Types**: Streaks, completions, levels, habits created, challenges, and more

### 👥 Social & Community
- **Group Challenges**: Create and join habit challenges with others
- **Challenge Tracking**: Monitor progress and participant counts
- **Leaderboards**: View challenge participants and their progress
- **Accountability**: Stay motivated with community support

### ⚙️ Advanced Features
- **Flexible Tracking**: Support for check-off, counter, and duration tracking types
- **Custom Frequencies**: Daily, weekly, or specific days of the week
- **Edit History**: Modify or delete past entries
- **Dark Mode**: Toggle between light and dark themes
- **Admin Panel**: User management and role assignment (first user becomes admin)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Recharts
- **Routing**: React Router v6

## Project Info

### Database Schema
- **profiles**: User profiles with role management
- **habits**: Habit definitions with frequency settings
- **habit_logs**: Daily completion tracking
- **habit_streaks**: Streak calculations
- **user_stats**: XP, levels, and gamification data
- **achievements**: Badge definitions (40 pre-loaded achievements across 11 categories)
- **user_achievements**: User-earned badges
- **challenges**: Group challenges
- **challenge_participants**: Challenge membership
- **reminders**: Custom reminder settings

### Authentication
- Dual authentication methods: Google SSO and Email/Password
- Google OAuth 2.0 for one-click sign-in
- Traditional email/password authentication with secure hashing
- Automatic session persistence across browser sessions
- First registered user automatically becomes admin
- Secure RLS policies for data protection
- Username extracted from email automatically (part before @)

## Project Directory

```
├── README.md                  # Documentation
├── TODO.md                    # Development progress tracker
├── components.json            # Component library configuration
├── index.html                 # Entry file
├── package.json               # Package management
├── postcss.config.js          # PostCSS configuration
├── public                     # Static resources directory
│   ├── favicon.png           # Icon
│   └── images                # Image resources
├── src                        # Source code directory
│   ├── App.tsx               # Entry file with routing
│   ├── components            # Components directory
│   │   ├── common           # Common components (RouteGuard, PageMeta)
│   │   ├── habits           # Habit-specific components (HabitForm)
│   │   ├── layouts          # Layout components (MainLayout)
│   │   └── ui               # shadcn/ui components
│   ├── contexts             # React contexts (AuthContext)
│   ├── db                   # Database configuration
│   │   ├── api.ts          # Database API functions
│   │   └── supabase.ts     # Supabase client
│   ├── hooks                # Custom hooks
│   ├── index.css            # Global styles with design tokens
│   ├── lib                  # Utility library
│   ├── main.tsx             # Entry file
│   ├── routes.tsx           # Routing configuration
│   ├── pages                # Pages directory
│   │   ├── DashboardPage.tsx      # Main dashboard
│   │   ├── HabitsPage.tsx         # Habit management
│   │   ├── NewHabitPage.tsx       # Create habit
│   │   ├── EditHabitPage.tsx      # Edit habit
│   │   ├── AnalyticsPage.tsx      # Analytics & insights
│   │   ├── AchievementsPage.tsx   # Achievement badges
│   │   ├── ChallengesPage.tsx     # Group challenges
│   │   ├── SettingsPage.tsx       # User settings
│   │   ├── AdminPage.tsx          # Admin panel
│   │   ├── LoginPage.tsx          # Login
│   │   └── RegisterPage.tsx       # Registration
│   ├── types                # Type definitions
│   │   └── types.ts        # Database and app types
├── tsconfig.app.json        # TypeScript frontend configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript Node.js configuration
└── vite.config.ts           # Vite configuration
```

## Key Benefits

### 🔐 Secure Authentication
- **Email/Password Authentication**: Traditional and secure authentication method
- **Always Logged In**: Your session persists automatically - sign in once and you're done
- **Secure**: Industry-standard password hashing and secure session management
- **Privacy First**: Your credentials are stored securely in the database

### 📱 Cross-Device Access
- **Mobile-Optimized**: Fully responsive design works perfectly on phones, tablets, and desktops
- **Touch-Friendly**: Large tap targets and intuitive mobile navigation
- **Seamless Sync**: All your habits and progress sync automatically across devices
- **Sign in on any device** with your email and password
- **Session persists** until you explicitly sign out

## Getting Started

### Prerequisites

```bash
# Node.js ≥ 20
# npm ≥ 10
# Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### Installation

1. **Download and extract the code package**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev -- --host 127.0.0.1
   ```
   Or if the above fails:
   ```bash
   npx vite --host 127.0.0.1
   ```

4. **Open your browser**
   Navigate to `http://127.0.0.1:5173` (or the port shown in terminal)

### First Time Setup

**Sign up with Email**
1. Click the "Sign Up" tab on the login page
2. Enter your email address and create a password (minimum 6 characters)
3. Click "Create Account"
4. You're automatically logged in!

**Sign in with Email**
1. Click the "Sign In" tab on the login page
2. Enter your email address and password
3. Click "Sign In"
4. You're logged in!

**Admin Privileges**: The first user to sign up automatically becomes an admin

**Session Persistence**: Your session is saved automatically - you won't need to sign in again unless you explicitly sign out

### Usage Guide

#### Creating Your First Habit
1. Click "New Habit" button on the dashboard
2. Fill in habit details:
   - **Name**: e.g., "Read 10 pages"
   - **Description**: Optional details about your habit
   - **Icon & Color**: Choose from 12 icons and 8 colors
   - **Frequency**: Daily, Weekly, or Custom days
   - **Tracking Type**: Simple check-off, Counter, or Duration
3. Click "Create Habit"

#### Tracking Habits
- **Quick Check-off**: Click the checkmark button on any habit card
- **View Progress**: See your streak, completion rate, and XP on the dashboard
- **Edit/Delete**: Manage habits from the "My Habits" page

#### Viewing Analytics
- Navigate to "Analytics" to see:
  - 30-day completion trends
  - Weekday performance breakdown
  - Personalized insights and recommendations

#### Unlocking Achievements
- Complete habits to earn XP and unlock badges
- View all achievements and your progress in the "Achievements" page
- **40 achievements** available across 11 categories:
  - Total Completions (7 achievements)
  - Streaks (7 achievements)
  - Levels (5 achievements)
  - Habit Creation (4 achievements)
  - XP Milestones (3 achievements)
  - Challenge Creation (2 achievements)
  - Challenge Participation (2 achievements)
  - Active Habits (3 achievements)
  - Perfect Days (3 achievements - coming soon)
  - Early Bird (2 achievements - coming soon)
  - Comebacks (2 achievements - coming soon)
- Each achievement awards 50 XP bonus
- See `ACHIEVEMENTS_GUIDE.md` for complete details

#### Joining Challenges
- Browse public challenges in the "Challenges" page
- Create your own challenge to invite others
- Track your progress and compete with participants

#### Admin Features (First User Only)
- Access the "Admin Panel" from the user menu
- View all registered users
- Assign or revoke admin roles

## Troubleshooting

### Blank Screen After Login

If you experience a blank screen after signing in or signing up, please refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) for detailed solutions.

**Quick checks:**
1. Open browser console (F12) and look for error messages
2. Verify your `.env` file has correct Supabase credentials
3. Check that database tables and triggers exist in Supabase
4. Clear browser cache and cookies
5. Try a different browser

The application includes detailed console logging to help diagnose issues. Look for messages prefixed with:
- `[AuthContext]` - Authentication state changes
- `[RouteGuard]` - Navigation and route protection
- `[LoginPage]` - Login/signup process

For complete troubleshooting steps, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Design System

### Color Scheme
- **Primary**: Calming teal (#10b981) for main actions
- **Success**: Green for completed habits
- **Warning**: Soft red for missed habits
- **Muted**: Gray for inactive states
- **Background**: Light blue-green for a calming atmosphere

### Typography
- Clean, readable fonts with clear hierarchy
- Emphasis on habit names and streak counts

### Layout
- Card-based design with rounded corners
- Smooth animations for interactions
- Responsive grid layouts
- Mobile-first approach with desktop optimization

## Development Guidelines

### How to edit code locally?

You can choose [VSCode](https://code.visualstudio.com/Download) or any IDE you prefer. The only requirement is to have Node.js and npm installed.

### Environment Requirements

```
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### Installing Node.js on Windows

```
# Step 1: Visit the Node.js official website: https://nodejs.org/, click download. The website will automatically suggest a suitable version (32-bit or 64-bit) for your system.
# Step 2: Run the installer: Double-click the downloaded installer to run it.
# Step 3: Complete the installation: Follow the installation wizard to complete the process.
# Step 4: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### Installing Node.js on macOS

```
# Step 1: Using Homebrew (Recommended method): Open Terminal. Type the command `brew install node` and press Enter. If Homebrew is not installed, you need to install it first by running the following command in Terminal:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Alternatively, use the official installer: Visit the Node.js official website. Download the macOS .pkg installer. Open the downloaded .pkg file and follow the prompts to complete the installation.
# Step 2: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### After installation, follow these steps:

```
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run the command to start the development server: npm run dev -- --host 127.0.0.1
# Step 6: if step 5 failed, try this command to start the development server: npx vite --host 127.0.0.1
```

### How to develop backend services?

Configure environment variables and install relevant dependencies.If you need to use a database, please use the official version of Supabase.

## Learn More

You can also check the help documentation: Download and Building the app（ [https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en](https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en)）to learn more detailed content.
