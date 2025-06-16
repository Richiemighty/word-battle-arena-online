
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Target, Clock, Users, Crown, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  current_turn: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: string;
  category: string;
  game_mode: string;
  time_limit: number;
  turn_time_limit: number;
  words_used: string[];
  started_at: string | null;
  ended_at: string | null;
}

interface GameMove {
  id: string;
  game_id: string;
  player_id: string;
  word: string;
  points_earned: number;
  is_valid: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
}

interface MultiplayerGameRoomProps {
  gameId: string;
  currentUserId: string;
}

const MultiplayerGameRoom = ({ gameId, currentUserId }: MultiplayerGameRoomProps) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Profile | null>(null);
  const [opponent, setOpponent] = useState<Profile | null>(null);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [lastWord, setLastWord] = useState("");
  const { playSound } = useSoundEffects();
  
  const navigate = useNavigate();

  // Common words for validation
  const commonWords = [
    "apple", "elephant", "tiger", "rain", "night", "tree", "egg", "gold", "dog", "game",
    "mouse", "sun", "net", "top", "pen", "note", "earth", "hat", "table", "energy",
    "yellow", "water", "road", "dance", "eye", "green", "nest", "time", "end",
    "door", "rock", "key", "yarn", "new", "wind", "duck", "king", "garden", "north",
    "cat", "bat", "rat", "hat", "mat", "fat", "sat", "pat", "vat", "chat",
    "car", "bar", "far", "jar", "tar", "war", "star", "scar", "char", "czar",
    "book", "look", "took", "cook", "hook", "nook", "brook", "crook", "shook"
  ];

  // Category words
  const categoryWords = {
    Animals: ["lion", "tiger", "elephant", "giraffe", "zebra", "monkey", "bear", "wolf", "fox", "rabbit"],
    Countries: ["france", "japan", "brazil", "canada", "germany", "italy", "spain", "mexico", "india", "china"],
    Food: ["pizza", "burger", "pasta", "sushi", "salad", "cake", "bread", "rice", "soup", "fruit"],
    Movies: ["avatar", "titanic", "batman", "superman", "starwars", "marvel", "disney", "action", "comedy", "drama"],
    Sports: ["football", "basketball", "tennis", "swimming", "running", "boxing", "golf", "baseball", "soccer", "hockey"],
    Colors: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown"],
    Fruits: ["apple", "banana", "orange", "mango", "grape", "strawberry", "pineapple", "watermelon", "kiwi", "peach"]
  };

  useEffect(() => {
    if (gameId && currentUserId) {
      fetchGameSession();
      setupRealtimeSubscription();
    }
  }, [gameId, currentUserId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameSession?.status === 'active' && gameSession.current_turn === currentUserId && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameSession?.current_turn === currentUserId) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameSession, currentUserId]);

  const fetchGameSession = async () => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;

      setGameSession(gameData);

      // Fetch player profiles
      const [{ data: player1 }, { data: player2 }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", gameData.player1_id).single(),
        supabase.from("profiles").select("*").eq("id", gameData.player2_id).single()
      ]);

      if (currentUserId === gameData.player1_id) {
        setCurrentPlayer(player1);
        setOpponent(player2);
      } else {
        setCurrentPlayer(player2);
        setOpponent(player1);
      }

      // Get last move to set the current word for word chain
      if (gameData.game_mode === 'wordchain') {
        const { data: lastMove } = await supabase
          .from("game_moves")
          .select("word")
          .eq("game_id", gameId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (lastMove) {
          setLastWord(lastMove.word);
        }
      }

      setTimeLeft(gameData.turn_time_limit || 30);
    } catch (error) {
      console.error("Error fetching game session:", error);
      toast({
        title: "Error",
        description: "Failed to load game session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${gameId}` },
        (payload) => {
          if (payload.new) {
            setGameSession(payload.new as GameSession);
            setTimeLeft(payload.new.turn_time_limit || 30);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_moves' },
        (payload) => {
          if (payload.new && payload.new.game_id === gameId) {
            const move = payload.new as GameMove;
            if (gameSession?.game_mode === 'wordchain') {
              setLastWord(move.word);
            }
            if (move.player_id !== currentUserId) {
              playSound('notification');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const isValidWord = (word: string): boolean => {
    const lowerWord = word.toLowerCase().trim();
    
    if (gameSession?.game_mode === 'wordchain') {
      // For word chain, check if word exists and follows chain rules
      if (!lastWord) return commonWords.includes(lowerWord) || lowerWord.length >= 3;
      
      const lastLetter = lastWord[lastWord.length - 1].toLowerCase();
      const firstLetter = lowerWord[0].toLowerCase();
      
      return firstLetter === lastLetter && 
             (commonWords.includes(lowerWord) || lowerWord.length >= 3) &&
             !gameSession.words_used.includes(lowerWord);
    } else {
      // For category mode, check if word belongs to category
      const categoryWordList = categoryWords[gameSession?.category as keyof typeof categoryWords] || [];
      return categoryWordList.includes(lowerWord) && !gameSession.words_used.includes(lowerWord);
    }
  };

  const submitWord = async () => {
    if (!userInput.trim() || !gameSession || submitting) return;
    
    const word = userInput.toLowerCase().trim();

    if (gameSession.status !== 'active') {
      toast({
        title: "Game not active",
        description: "Wait for the game to start",
        variant: "destructive",
      });
      return;
    }

    if (gameSession.current_turn !== currentUserId) {
      toast({
        title: "Not your turn",
        description: "Wait for your opponent to play",
        variant: "destructive",
      });
      return;
    }

    if (!isValidWord(word)) {
      let errorMessage = "Invalid word!";
      if (gameSession.game_mode === 'wordchain' && lastWord) {
        errorMessage = `Word must start with "${lastWord[lastWord.length - 1].toUpperCase()}"`;
      } else if (gameSession.game_mode === 'category') {
        errorMessage = `Word must be in the ${gameSession.category} category`;
      }
      
      toast({
        title: "Invalid word",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Calculate points
      const points = word.length * 10;
      
      // Add move to database
      const { error: moveError } = await supabase
        .from("game_moves")
        .insert({
          game_id: gameId,
          player_id: currentUserId,
          word: word,
          points_earned: points,
          is_valid: true
        });

      if (moveError) throw moveError;

      // Update game session
      const opponentId = gameSession.player1_id === currentUserId ? gameSession.player2_id : gameSession.player1_id;
      const currentScore = gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score;
      const newScore = currentScore + points;
      
      const updates: any = {
        current_turn: opponentId,
        words_used: [...gameSession.words_used, word],
        turn_time_limit: 30
      };

      if (gameSession.player1_id === currentUserId) {
        updates.player1_score = newScore;
      } else {
        updates.player2_score = newScore;
      }

      const { error: updateError } = await supabase
        .from("game_sessions")
        .update(updates)
        .eq("id", gameId);

      if (updateError) throw updateError;

      await playSound('correct');
      setUserInput("");
      setLastWord(word);
      setGameMessages(prev => [...prev, `You played: ${word} (+${points} points)`]);
      
    } catch (error) {
      console.error("Error submitting word:", error);
      toast({
        title: "Error",
        description: "Failed to submit word",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = async () => {
    if (gameSession?.current_turn !== currentUserId) return;
    
    try {
      const opponentId = gameSession.player1_id === currentUserId ? gameSession.player2_id : gameSession.player1_id;
      
      await supabase
        .from("game_sessions")
        .update({ 
          current_turn: opponentId,
          turn_time_limit: 30
        })
        .eq("id", gameId);

      toast({
        title: "Time's up!",
        description: "Your turn has been skipped",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error("Error handling time up:", error);
    }
  };

  const forfeitGame = async () => {
    try {
      const opponentId = gameSession?.player1_id === currentUserId ? gameSession?.player2_id : gameSession?.player1_id;
      
      await supabase
        .from("game_sessions")
        .update({ 
          status: 'completed',
          winner_id: opponentId,
          ended_at: new Date().toISOString()
        })
        .eq("id", gameId);

      toast({
        title: "Game forfeited",
        description: "You have forfeited the game",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error forfeiting game:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (!gameSession || !currentPlayer || !opponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Game not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isMyTurn = gameSession.current_turn === currentUserId;
  const myScore = gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score;
  const opponentScore = gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score;
  const GameModeIcon = gameSession.game_mode === 'wordchain' ? Link : Target;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text flex items-center gap-2">
            <GameModeIcon className="h-6 w-6" />
            {gameSession.game_mode === 'wordchain' ? 'Word Chain Battle' : `${gameSession.category} Battle`}
          </h1>
        </div>

        {/* Game Status */}
        <Card className="bg-gradient-card mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-lg font-bold">{currentPlayer.display_name || currentPlayer.username}</div>
                <div className="text-2xl font-bold text-blue-500">{myScore}</div>
              </div>
              <div className="text-center">
                <Badge variant={gameSession.status === 'active' ? 'default' : 'secondary'}>
                  {gameSession.status === 'waiting' ? 'Waiting for opponent' : 
                   gameSession.status === 'active' ? 'Game Active' : 'Game Over'}
                </Badge>
                {gameSession.status === 'active' && (
                  <div className="mt-2">
                    <Badge variant={isMyTurn ? 'default' : 'outline'}>
                      {isMyTurn ? 'Your Turn' : `${opponent.display_name || opponent.username}'s Turn`}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{opponent.display_name || opponent.username}</div>
                <div className="text-2xl font-bold text-red-500">{opponentScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        {gameSession.status === 'active' && (
          <Card className="bg-gradient-card mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                {gameSession.game_mode === 'wordchain' && lastWord && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Last word:</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">{lastWord.toUpperCase()}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your word must start with "{lastWord[lastWord.length - 1].toUpperCase()}"
                    </p>
                  </div>
                )}
                {gameSession.game_mode === 'category' && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Category:</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">{gameSession.category}</Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMyTurn ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && submitWord()}
                      placeholder={gameSession.game_mode === 'wordchain' ? 
                        (lastWord ? `Enter word starting with "${lastWord[lastWord.length - 1].toUpperCase()}"` : "Enter your word") :
                        `Enter a ${gameSession.category.toLowerCase()} word`
                      }
                      className="bg-input"
                      disabled={submitting}
                    />
                    <Button onClick={submitWord} disabled={!userInput.trim() || submitting}>
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time Remaining</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <Progress value={(timeLeft / 30) * 100} className="h-2" />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Waiting for {opponent.display_name || opponent.username} to play...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Used Words */}
        {gameSession.words_used && gameSession.words_used.length > 0 && (
          <Card className="bg-gradient-card mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Words Used ({gameSession.words_used.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {gameSession.words_used.map((word, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Messages */}
        {gameMessages.length > 0 && (
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-sm">Game Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {gameMessages.map((message, index) => (
                  <p key={index} className="text-xs text-muted-foreground">{message}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forfeit Button */}
        {gameSession.status === 'active' && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={forfeitGame} className="text-destructive">
              Forfeit Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameRoom;
