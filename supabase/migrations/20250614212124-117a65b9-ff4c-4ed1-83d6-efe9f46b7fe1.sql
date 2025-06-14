
-- Create table for game invitations/notifications
CREATE TABLE public.game_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  game_session_id UUID REFERENCES public.game_sessions(id),
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '5 minutes')
);

-- Add RLS policies for game invitations
ALTER TABLE public.game_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game invitations" 
  ON public.game_invitations 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create game invitations" 
  ON public.game_invitations 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received invitations" 
  ON public.game_invitations 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Update game_sessions table to include more game state
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS turn_time_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_credits INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Enable realtime for game tables
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.game_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.game_moves REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_moves;

-- Create function to update user stats after game
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game(
  user_id UUID,
  credits_earned INTEGER,
  is_winner BOOLEAN,
  is_draw BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    total_credits = total_credits + credits_earned,
    total_wins = total_wins + CASE WHEN is_winner THEN 1 ELSE 0 END,
    total_losses = total_losses + CASE WHEN NOT is_winner AND NOT is_draw THEN 1 ELSE 0 END,
    total_draws = total_draws + CASE WHEN is_draw THEN 1 ELSE 0 END,
    rank = CASE 
      WHEN total_credits + credits_earned >= 5000 THEN 'Master'
      WHEN total_credits + credits_earned >= 2000 THEN 'Expert'
      WHEN total_credits + credits_earned >= 1000 THEN 'Advanced'
      WHEN total_credits + credits_earned >= 500 THEN 'Intermediate'
      ELSE 'Beginner'
    END
  WHERE id = user_id;
END;
$$;
