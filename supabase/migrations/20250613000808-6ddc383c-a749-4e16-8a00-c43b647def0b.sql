
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_credits INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Beginner',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(requester_id, addressee_id)
);

-- Create game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')) DEFAULT 'waiting',
  current_turn UUID REFERENCES public.profiles(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id),
  words_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create game moves table
CREATE TABLE public.game_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  time_taken INTEGER, -- in seconds
  points_earned INTEGER DEFAULT 0,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON public.friendships FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendship status" ON public.friendships FOR UPDATE 
USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- RLS Policies for game sessions
CREATE POLICY "Users can view their games" ON public.game_sessions FOR SELECT 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create games" ON public.game_sessions FOR INSERT 
WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update their games" ON public.game_sessions FOR UPDATE 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- RLS Policies for game moves
CREATE POLICY "Users can view moves from their games" ON public.game_moves FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.game_sessions 
  WHERE id = game_moves.game_id 
  AND (player1_id = auth.uid() OR player2_id = auth.uid())
));

CREATE POLICY "Users can insert their own moves" ON public.game_moves FOR INSERT 
WITH CHECK (auth.uid() = player_id);

-- RLS Policies for chat messages
CREATE POLICY "Users can view their messages" ON public.chat_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.chat_messages FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user online status
CREATE OR REPLACE FUNCTION public.update_user_online_status(user_id UUID, is_online BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_online = update_user_online_status.is_online,
      last_seen = CASE WHEN update_user_online_status.is_online = false THEN now() ELSE last_seen END
  WHERE id = user_id;
END;
$$;
