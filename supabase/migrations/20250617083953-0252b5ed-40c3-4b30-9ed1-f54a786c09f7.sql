
-- Add columns to track game mode specific statistics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wordchain_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordchain_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordchain_draws INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordchain_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_draws INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordchain_rank TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS category_rank TEXT DEFAULT 'Beginner';

-- Add countdown_started_at to game_sessions for tracking countdown
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS countdown_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS game_started_at TIMESTAMP WITH TIME ZONE;

-- Update the user stats function to handle game mode specific stats
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game(
  user_id uuid, 
  credits_earned integer, 
  is_winner boolean, 
  is_draw boolean,
  game_mode_param text DEFAULT 'category'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update general stats
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
  
  -- Update game mode specific stats
  IF game_mode_param = 'wordchain' THEN
    UPDATE public.profiles 
    SET 
      wordchain_credits = wordchain_credits + credits_earned,
      wordchain_wins = wordchain_wins + CASE WHEN is_winner THEN 1 ELSE 0 END,
      wordchain_losses = wordchain_losses + CASE WHEN NOT is_winner AND NOT is_draw THEN 1 ELSE 0 END,
      wordchain_draws = wordchain_draws + CASE WHEN is_draw THEN 1 ELSE 0 END,
      wordchain_rank = CASE 
        WHEN wordchain_credits + credits_earned >= 5000 THEN 'Word Master'
        WHEN wordchain_credits + credits_earned >= 2000 THEN 'Chain Expert'
        WHEN wordchain_credits + credits_earned >= 1000 THEN 'Link Advanced'
        WHEN wordchain_credits + credits_earned >= 500 THEN 'Word Intermediate'
        ELSE 'Chain Beginner'
      END
    WHERE id = user_id;
  ELSE
    UPDATE public.profiles 
    SET 
      category_credits = category_credits + credits_earned,
      category_wins = category_wins + CASE WHEN is_winner THEN 1 ELSE 0 END,
      category_losses = category_losses + CASE WHEN NOT is_winner AND NOT is_draw THEN 1 ELSE 0 END,
      category_draws = category_draws + CASE WHEN is_draw THEN 1 ELSE 0 END,
      category_rank = CASE 
        WHEN category_credits + credits_earned >= 5000 THEN 'Category Master'
        WHEN category_credits + credits_earned >= 2000 THEN 'Topic Expert'
        WHEN category_credits + credits_earned >= 1000 THEN 'Theme Advanced'
        WHEN category_credits + credits_earned >= 500 THEN 'Category Intermediate'
        ELSE 'Topic Beginner'
      END
    WHERE id = user_id;
  END IF;
END;
$function$
