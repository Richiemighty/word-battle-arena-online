import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Users, Crown, RotateCcw, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  current_turn: string;
  player1_score: number;
  player2_score: number;
  category: string;
  status: string;
  words_used: string[];
  started_at: string;
  time_limit: number;
  turn_time_limit: number;
  max_credits: number;
  winner_id?: string;
  player1: {
    id: string;
    username: string;
    display_name: string;
  };
  player2: {
    id: string;
    username: string;
    display_name: string;
  };
}

interface MultiplayerGameRoomProps {
  gameId: string;
  currentUserId: string;
}

const MultiplayerGameRoom = ({ gameId, currentUserId }: MultiplayerGameRoomProps) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(120);
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const wordDatabase: Record<string, string[]> = {
    "Animals": ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'kangaroo', 'dolphin'],
    "Countries": ['france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india'],
    "Food": ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread'],
    "Sports": ['football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling'],
    "Movies": ['avatar', 'titanic', 'inception', 'matrix', 'gladiator', 'jaws', 'rocky', 'alien', 'batman', 'superman'],
    "Technology": ['computer', 'smartphone', 'internet', 'software', 'hardware', 'network', 'database', 'programming', 'algorithm', 'artificial'],
    "Nature": ['mountain', 'ocean', 'forest', 'desert', 'river', 'lake', 'volcano', 'beach', 'canyon', 'valley'],
    "History": ['egypt', 'rome', 'greece', 'medieval', 'renaissance', 'revolution', 'empire', 'kingdom', 'dynasty', 'civilization'],
    "Colors": ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'],
    "Fruits": ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple', 'watermelon', 'peach', 'cherry']
  };

  useEffect(() => {
    fetchGameSession();
    
    // Listen for real-time updates
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game session updated:', payload);
          fetchGameSession();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_moves',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('New move:', payload);
          fetchGameSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    if (gameSession?.status === 'active' && !gameStarted) {
      setGameStarted(true);
      // Start countdown for receiver advantage
      if (gameSession.player2_id === currentUserId) {
        startCountdown();
      } else {
        setGameActive(true);
        setTimeLeft(gameSession.turn_time_limit);
        setGameTimeLeft(gameSession.time_limit);
      }
    }
  }, [gameSession, currentUserId, gameStarted]);

  // Game timer
  useEffect(() => {
    if (gameActive && gameTimeLeft > 0) {
      const timer = setTimeout(() => setGameTimeLeft(gameTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && gameTimeLeft === 0) {
      endGame('time');
    }
  }, [gameTimeLeft, gameActive]);

  // Turn timer
  useEffect(() => {
    if (gameActive && timeLeft > 0 && gameSession?.current_turn === currentUserId) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0 && gameSession?.current_turn === currentUserId) {
      // Player ran out of time
      switchTurn();
    }
  }, [timeLeft, gameActive, gameSession?.current_turn, currentUserId]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && gameStarted && !gameActive) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && gameStarted && !gameActive) {
      setGameActive(true);
      setTimeLeft(gameSession?.turn_time_limit || 30);
      setGameTimeLeft(gameSession?.time_limit || 120);
      inputRef.current?.focus();
    }
  }, [countdown, gameStarted, gameActive, gameSession]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const fetchGameSession = async () => {
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select(`
          *,
          player1:profiles!game_sessions_player1_id_fkey(id, username, display_name),
          player2:profiles!game_sessions_player2_id_fkey(id, username, display_name)
        `)
        .eq("id", gameId)
        .single();

      if (error) throw error;
      
      // Handle words_used properly - it might be a JSON array or string array
      const processedData = {
        ...data,
        words_used: Array.isArray(data.words_used) 
          ? data.words_used 
          : data.words_used 
            ? JSON.parse(data.words_used as string) 
            : []
      };
      
      setGameSession(processedData);
      
      // Check if game has ended
      if (data.status === 'completed') {
        setGameEnded(true);
        setGameActive(false);
      }
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

  const submitWord = async () => {
    if (!currentWord.trim() || !gameSession) return;

    const word = currentWord.toLowerCase().trim();
    const validWords = wordDatabase[gameSession.category] || [];
    
    // Check if word is valid
    if (!validWords.includes(word)) {
      toast({
        title: "Invalid Word!",
        description: `"${currentWord}" is not a valid ${gameSession.category.toLowerCase()}`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Check if word was already used
    if (gameSession.words_used.includes(word)) {
      toast({
        title: "Word Already Used!",
        description: `"${currentWord}" has already been used`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Calculate score based on time
    const timeBonus = Math.max(1, Math.floor(timeLeft / 5));
    const wordScore = 10 + timeBonus;

    try {
      // Record the move
      await supabase.from("game_moves").insert({
        game_id: gameId,
        player_id: currentUserId,
        word: word,
        points_earned: wordScore,
        time_taken: gameSession.turn_time_limit - timeLeft,
        is_valid: true
      });

      // Update game session
      const isPlayer1 = gameSession.player1_id === currentUserId;
      const newScore = isPlayer1 ? gameSession.player1_score + wordScore : gameSession.player2_score + wordScore;
      const newWordsUsed = [...gameSession.words_used, word];
      
      await supabase
        .from("game_sessions")
        .update({
          [isPlayer1 ? 'player1_score' : 'player2_score']: newScore,
          words_used: newWordsUsed,
          current_turn: isPlayer1 ? gameSession.player2_id : gameSession.player1_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", gameId);

      toast({
        title: "Great Word!",
        description: `+${wordScore} points! Time bonus: +${timeBonus}`,
      });

      setCurrentWord("");
      setTimeLeft(gameSession.turn_time_limit);

      // Check win condition
      if (newScore >= gameSession.max_credits) {
        endGame('score');
      }
    } catch (error) {
      console.error("Error submitting word:", error);
      toast({
        title: "Error",
        description: "Failed to submit word",
        variant: "destructive",
      });
    }
  };

  const switchTurn = async () => {
    if (!gameSession) return;

    const nextPlayer = gameSession.current_turn === gameSession.player1_id 
      ? gameSession.player2_id 
      : gameSession.player1_id;

    await supabase
      .from("game_sessions")
      .update({
        current_turn: nextPlayer,
        updated_at: new Date().toISOString()
      })
      .eq("id", gameId);

    setTimeLeft(gameSession.turn_time_limit);
  };

  const endGame = async (reason: 'time' | 'score') => {
    if (!gameSession) return;

    setGameActive(false);
    
    const player1Score = gameSession.player1_score;
    const player2Score = gameSession.player2_score;
    
    let winnerId = null;
    let isDraw = false;

    if (player1Score > player2Score) {
      winnerId = gameSession.player1_id;
    } else if (player2Score > player1Score) {
      winnerId = gameSession.player2_id;
    } else {
      isDraw = true;
    }

    try {
      // Update game session
      await supabase
        .from("game_sessions")
        .update({
          status: 'completed',
          winner_id: winnerId,
          ended_at: new Date().toISOString()
        })
        .eq("id", gameId);

      // Update player stats
      await supabase.rpc("update_user_stats_after_game", {
        user_id: gameSession.player1_id,
        credits_earned: player1Score,
        is_winner: winnerId === gameSession.player1_id,
        is_draw: isDraw
      });

      await supabase.rpc("update_user_stats_after_game", {
        user_id: gameSession.player2_id,
        credits_earned: player2Score,
        is_winner: winnerId === gameSession.player2_id,
        is_draw: isDraw
      });

      const resultMessage = isDraw 
        ? "Game ended in a draw!"
        : winnerId === currentUserId 
          ? "Congratulations! You won!"
          : "Game over! Better luck next time!";

      toast({
        title: "Game Over!",
        description: resultMessage,
      });
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  const playAgain = () => {
    navigate("/dashboard");
  };

  const chooseNewCategory = () => {
    navigate("/dashboard");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (!gameSession) {
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
  const opponent = gameSession.player1_id === currentUserId ? gameSession.player2 : gameSession.player1;
  const myScore = gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score;
  const opponentScore = gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score;

  // Waiting room
  if (gameSession.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              Waiting for Player
            </CardTitle>
            <p className="text-muted-foreground">Game will start when both players join</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl animate-pulse">⏳</div>
            <div className="space-y-2">
              <p><strong>Category:</strong> {gameSession.category}</p>
              <p><strong>Opponent:</strong> {opponent.display_name || opponent.username}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Countdown phase
  if (gameStarted && !gameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              {gameSession.category} Battle
            </CardTitle>
            <p className="text-muted-foreground">Get ready!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-8xl font-bold text-primary mb-4 animate-countdown">
              {countdown}
            </div>
            <p className="text-lg text-muted-foreground">
              Game starts in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game ended - show options
  if (gameEnded || gameSession?.status === 'completed') {
    const isWinner = gameSession?.winner_id === currentUserId;
    const isDraw = !gameSession?.winner_id;
    const opponent = gameSession?.player1_id === currentUserId ? gameSession?.player2 : gameSession?.player1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text mb-4">
              {isDraw ? "It's a Draw!" : isWinner ? "You Won! 🏆" : "Game Over"}
            </CardTitle>
            <div className="space-y-2">
              <p className="text-lg">Final Scores:</p>
              <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg">
                <span>You: {gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score}</span>
                <span>{opponent?.display_name || opponent?.username}: {gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={playAgain}
                className="flex-1 bg-gradient-battle hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button 
                variant="outline" 
                onClick={chooseNewCategory}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text text-center">
            {gameSession?.category} Battle
          </h1>
          <div className="w-16 sm:w-24" />
        </div>

        {/* Game Stats - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-card border-accent/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Clock className="h-4 sm:h-6 w-4 sm:w-6 text-accent mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Game Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Clock className="h-4 sm:h-6 w-4 sm:w-6 text-primary mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">{timeLeft}s</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Turn Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Trophy className="h-4 sm:h-6 w-4 sm:w-6 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {gameSession?.player1_id === currentUserId ? gameSession?.player1_score : gameSession?.player2_score}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Users className="h-4 sm:h-6 w-4 sm:w-6 text-red-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {gameSession?.player1_id === currentUserId ? gameSession?.player2_score : gameSession?.player1_score}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Opponent</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Turn - Mobile Responsive */}
        <Card className="bg-gradient-card border-primary/40 mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              {gameSession?.current_turn === currentUserId ? (
                <>
                  <Crown className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-base">Your Turn - Name a {gameSession?.category.toLowerCase().slice(0, -1)}!</span>
                </>
              ) : (
                <>
                  <Users className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <span className="text-xs sm:text-base">Waiting for opponent...</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Input
                ref={inputRef}
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && gameSession?.current_turn === currentUserId && submitWord()}
                placeholder={`Enter a ${gameSession?.category.toLowerCase().slice(0, -1)}...`}
                className="text-sm sm:text-lg py-3 sm:py-6 bg-input border-border focus:border-primary"
                disabled={!gameActive || gameSession?.current_turn !== currentUserId}
              />
              <Button 
                onClick={submitWord}
                disabled={!gameActive || gameSession?.current_turn !== currentUserId || !currentWord.trim()}
                className="px-4 sm:px-8 py-3 sm:py-6 bg-gradient-battle hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <Badge variant={gameSession?.current_turn === currentUserId ? "default" : "secondary"} className="text-xs sm:text-sm">
                {gameSession?.current_turn === currentUserId ? "YOUR TURN" : "OPPONENT'S TURN"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Used Words - Mobile Responsive */}
        {gameSession?.words_used.length > 0 && (
          <Card className="bg-gradient-card border-secondary/40">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Words Used ({gameSession.words_used.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {gameSession.words_used.map((word, index) => (
                  <span 
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameRoom;
