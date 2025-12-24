
-- Add more achievements to motivate users

-- Streak-based achievements (extending existing ones)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Streak Legend', 'Maintain a 100-day streak', '🏆', 'streak', 100),
('Year Champion', 'Maintain a 365-day streak', '🎖️', 'streak', 365),
('Consistency King', 'Maintain a 180-day streak', '👸', 'streak', 180);

-- Total completion achievements (more milestones)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Getting Started', 'Complete 10 habits', '🌱', 'total_completed', 10),
('On a Roll', 'Complete 50 habits', '🎲', 'total_completed', 50),
('Milestone Master', 'Complete 1000 habits', '🎆', 'total_completed', 1000),
('Legendary', 'Complete 2500 habits', '🌟', 'total_completed', 2500);

-- Level-based achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Rising Star', 'Reach level 10', '⭐', 'level', 10),
('Power Player', 'Reach level 20', '💫', 'level', 20),
('Elite Master', 'Reach level 50', '🔱', 'level', 50),
('Grandmaster', 'Reach level 100', '👑', 'level', 100);

-- Habit creation achievements (new type)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Habit Builder', 'Create 5 habits', '🏗️', 'habits_created', 5),
('Habit Architect', 'Create 10 habits', '🏛️', 'habits_created', 10),
('Habit Designer', 'Create 25 habits', '🎨', 'habits_created', 25),
('Habit Visionary', 'Create 50 habits', '🔮', 'habits_created', 50);

-- Perfect week achievements (new type - complete all habits for 7 days)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Perfect Week', 'Complete all habits for 7 consecutive days', '📅', 'perfect_days', 7),
('Perfect Fortnight', 'Complete all habits for 14 consecutive days', '📆', 'perfect_days', 14),
('Perfect Month', 'Complete all habits for 30 consecutive days', '🗓️', 'perfect_days', 30);

-- Challenge-based achievements (new type)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Challenge Starter', 'Create your first challenge', '🎯', 'challenges_created', 1),
('Challenge Master', 'Create 5 challenges', '🎪', 'challenges_created', 5),
('Team Player', 'Join 3 challenges', '🤝', 'challenges_joined', 3),
('Social Butterfly', 'Join 10 challenges', '🦋', 'challenges_joined', 10);

-- Early bird achievements (new type - complete habits early in the day)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Early Bird', 'Complete habits before 9 AM for 7 days', '🌅', 'early_completions', 7),
('Morning Champion', 'Complete habits before 9 AM for 30 days', '☀️', 'early_completions', 30);

-- Comeback achievements (new type - return after missing days)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Comeback Kid', 'Return and complete habits after missing 3+ days', '🔄', 'comebacks', 1),
('Never Give Up', 'Return and complete habits 5 times after breaks', '💪', 'comebacks', 5);

-- XP-based achievements (new type)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('XP Collector', 'Earn 1000 XP', '💰', 'xp', 1000),
('XP Hoarder', 'Earn 5000 XP', '💎', 'xp', 5000),
('XP Legend', 'Earn 10000 XP', '👑', 'xp', 10000);

-- Diversity achievements (new type - have multiple active habits)
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Multitasker', 'Have 5 active habits', '🎭', 'active_habits', 5),
('Juggler', 'Have 10 active habits', '🤹', 'active_habits', 10),
('Habit Collector', 'Have 20 active habits', '🎪', 'active_habits', 20);
