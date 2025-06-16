
-- Add the missing game_mode column to game_sessions table
ALTER TABLE public.game_sessions 
ADD COLUMN game_mode TEXT DEFAULT 'category';

-- Update existing records to have a default game_mode
UPDATE public.game_sessions 
SET game_mode = 'category' 
WHERE game_mode IS NULL;
