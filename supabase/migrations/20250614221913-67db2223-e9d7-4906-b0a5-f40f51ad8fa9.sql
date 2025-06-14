
-- Create avatars table with unlock levels
CREATE TABLE public.avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  unlock_level INTEGER NOT NULL DEFAULT 0,
  credits_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert 20 avatars with different unlock levels
INSERT INTO public.avatars (name, emoji, unlock_level, credits_required) VALUES
('Rookie', '🐱', 0, 0),
('Beginner', '🐶', 0, 0),
('Starter', '🐹', 0, 0),
('Learner', '🐰', 0, 0),
('Explorer', '🦊', 1, 500),
('Adventurer', '🐺', 1, 750),
('Hunter', '🦁', 2, 1000),
('Warrior', '🐯', 2, 1500),
('Knight', '🐻', 3, 2000),
('Champion', '🦄', 3, 2500),
('Hero', '🐉', 4, 3000),
('Legend', '🦅', 4, 3500),
('Master', '🔥', 5, 4000),
('Grand Master', '⚡', 5, 4500),
('Elite', '🌟', 6, 5000),
('Supreme', '💎', 6, 5500),
('Ultimate', '👑', 7, 6000),
('Mythic', '🎭', 7, 6500),
('Godlike', '🌈', 8, 7000),
('Transcendent', '✨', 8, 7500);

-- Add avatar_id and sound_enabled columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_id UUID REFERENCES public.avatars(id),
ADD COLUMN sound_enabled BOOLEAN NOT NULL DEFAULT true;

-- Create RLS policies for avatars table
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read avatars (they're public)
CREATE POLICY "Anyone can view avatars" 
  ON public.avatars 
  FOR SELECT 
  USING (true);

-- Create a function to get user's unlock level based on credits
CREATE OR REPLACE FUNCTION get_user_unlock_level(user_credits INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN user_credits >= 7500 THEN 8
    WHEN user_credits >= 6500 THEN 7
    WHEN user_credits >= 5500 THEN 6
    WHEN user_credits >= 4500 THEN 5
    WHEN user_credits >= 3500 THEN 4
    WHEN user_credits >= 2500 THEN 3
    WHEN user_credits >= 1500 THEN 2
    WHEN user_credits >= 750 THEN 1
    ELSE 0
  END;
$$;
