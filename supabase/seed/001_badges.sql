-- Initial Badge Definitions for CurioED v1.0
-- Run after schema migration to populate badges

-- Goals Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('first_goal', 'Goal Setter', 'Created your first goal', NULL, 'goals', 'agency', '{"type": "goal_count", "threshold": 1}'::jsonb, 10),
('five_goals', 'Ambitious Achiever', 'Created 5 goals', NULL, 'goals', 'agency', '{"type": "goal_count", "threshold": 5}'::jsonb, 25),
('first_goal_complete', 'Mission Accomplished', 'Completed your first goal', NULL, 'goals', 'transformation', '{"type": "goals_completed", "threshold": 1}'::jsonb, 15),
('three_goals_complete', 'Hat Trick', 'Completed 3 goals', NULL, 'goals', 'transformation', '{"type": "goals_completed", "threshold": 3}'::jsonb, 30);

-- Reflection Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('first_reflection', 'Reflection Rookie', 'Submitted your first reflection', NULL, 'reflections', 'reflection', '{"type": "reflection_count", "threshold": 1}'::jsonb, 10),
('week_streak_3', '3-Week Streak', 'Reflected 3 weeks in a row', NULL, 'reflections', 'reflection', '{"type": "consecutive_weeks", "threshold": 3}'::jsonb, 30),
('week_streak_5', 'Reflection Master', 'Reflected 5 weeks in a row', NULL, 'reflections', 'reflection', '{"type": "consecutive_weeks", "threshold": 5}'::jsonb, 50),
('ten_reflections', 'Deep Thinker', 'Submitted 10 reflections', NULL, 'reflections', 'reflection', '{"type": "reflection_count", "threshold": 10}'::jsonb, 40);

-- Project Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('first_project', 'Creator', 'Started your first project', NULL, 'projects', 'curiosity', '{"type": "project_count", "threshold": 1}'::jsonb, 10),
('project_complete', 'Finisher', 'Completed your first project', NULL, 'projects', 'transformation', '{"type": "projects_completed", "threshold": 1}'::jsonb, 25),
('stem_specialist', 'STEM Star', 'Completed 3 STEM projects', NULL, 'projects', 'framework', '{"type": "project_type_count", "project_type": "stem", "threshold": 3}'::jsonb, 40),
('multi_talent', 'Renaissance Creator', 'Completed projects in 3 different categories', NULL, 'projects', 'framework', '{"type": "project_diversity", "threshold": 3}'::jsonb, 50);

-- Engagement Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('early_bird', 'Early Bird', 'Logged in before 8am', NULL, 'engagement', 'agency', '{"type": "early_login", "hour": 8}'::jsonb, 5),
('night_owl', 'Night Owl', 'Logged in after 8pm', NULL, 'engagement', 'agency', '{"type": "late_login", "hour": 20}'::jsonb, 5),
('daily_streak_7', 'Week Warrior', '7 days of activity in a row', NULL, 'engagement', 'agency', '{"type": "daily_streak", "threshold": 7}'::jsonb, 40),
('monthly_active', 'Super User', 'Active for 30 days', NULL, 'engagement', 'transformation', '{"type": "active_days", "threshold": 30}'::jsonb, 100);

-- C.R.A.F.T. Framework Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('curiosity_spark', 'Curiosity Spark', 'Asked 5 questions in reflections', NULL, 'craft', 'curiosity', '{"type": "craft_element_count", "element": "curiosity", "threshold": 5}'::jsonb, 30),
('reflection_pro', 'Reflection Pro', 'Tagged 10 reflections', NULL, 'craft', 'reflection', '{"type": "craft_element_count", "element": "reflection", "threshold": 10}'::jsonb, 30),
('agency_champion', 'Agency Champion', 'Took initiative on 5 goals', NULL, 'craft', 'agency', '{"type": "craft_element_count", "element": "agency", "threshold": 5}'::jsonb, 30),
('framework_builder', 'Framework Builder', 'Applied framework to 5 projects', NULL, 'craft', 'framework', '{"type": "craft_element_count", "element": "framework", "threshold": 5}'::jsonb, 30),
('transformation_hero', 'Transformation Hero', 'Demonstrated growth in 10 activities', NULL, 'craft', 'transformation', '{"type": "craft_element_count", "element": "transformation", "threshold": 10}'::jsonb, 50);

-- Special Achievement Badges
INSERT INTO public.curioed_badges (code, name, description, icon_url, category, craft_element, criteria, points) VALUES
('pilot_pioneer', 'Pilot Pioneer', 'Newark 2026 Pilot Program Participant', NULL, 'engagement', NULL, '{"type": "manual_award"}'::jsonb, 100),
('craft_master', 'C.R.A.F.T. Master', 'Earned all 5 C.R.A.F.T. element badges', NULL, 'craft', NULL, '{"type": "badge_collection", "required_badges": ["curiosity_spark", "reflection_pro", "agency_champion", "framework_builder", "transformation_hero"]}'::jsonb, 200);
