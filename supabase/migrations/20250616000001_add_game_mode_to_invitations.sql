
-- Add game_mode column to game_invitations table
ALTER TABLE public.game_invitations 
ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'category';

-- Add game_mode column to game_sessions table  
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'category';

-- Update existing records to have proper game_mode
UPDATE public.game_invitations 
SET game_mode = CASE 
  WHEN category = 'WordChain' THEN 'wordchain'
  ELSE 'category'
END
WHERE game_mode IS NULL;

UPDATE public.game_sessions 
SET game_mode = CASE 
  WHEN category = 'WordChain' THEN 'wordchain'
  ELSE 'category'
END
WHERE game_mode IS NULL;
