
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGameLogic } from "@/hooks/useGameLogic";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import GameCountdown from "@/components/multiplayer/GameCountdown";
import GameStatus from "@/components/multiplayer/GameStatus";
import GameControls from "@/components/multiplayer/GameControls";
import WordsUsed from "@/components/multiplayer/WordsUsed";
import GameMessages from "@/components/multiplayer/GameMessages";
import GameRules from "@/components/multiplayer/GameRules";

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  current_turn: string;
  player1_score: number;
  player2_score: number;
  status: string;
  category: string;
  game_mode: string;
  words_used: string[];
  time_limit: number;
  turn_time_limit: number;
  max_credits: number;
  winner_id: string | null;
  countdown_started_at: string | null;
  game_started_at: string | null;
  ended_at: string | null;
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
  const navigate = useNavigate();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [countdownTime, setCountdownTime] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [turnStartTime, setTurnStartTime] = useState<Date | null>(null);
  const [currentPlayerProfile, setCurrentPlayerProfile] = useState<Profile | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<Profile | null>(null);
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const { isValidWord, submitWord, submitting } = useGameLogic();
  const { playSound } = useSoundEffects();

  // Get last word for word chain logic
  const getLastWord = useCallback(() => {
    if (!gameSession || gameSession.words_used.length === 0) return "";
    return gameSession.words_used[gameSession.words_used.length - 1];
  }, [gameSession]);

  // Check if it's current user's turn
  const isMyTurn = gameSession?.current_turn === currentUserId && gameSession?.status === 'active';

  // Fetch game session and profiles
  const fetchGameSession = useCallback(async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", gameId)
        .single();

      if (sessionError) throw sessionError;

      console.log("Game session fetched:", sessionData);
      setGameSession(sessionData);

      // Fetch player profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", [sessionData.player1_id, sessionData.player2_id]);

      if (profilesError) throw profilesError;

      const currentPlayer = profiles.find(p => p.id === currentUserId);
      const opponent = profiles.find(p => p.id !== currentUserId);
      
      setCurrentPlayerProfile(currentPlayer || null);
      setOpponentProfile(opponent || null);

      // Handle game state transitions
      if (sessionData.status === 'waiting') {
        // Check if both players are present, start countdown
        console.log("Starting countdown...");
        await startCountdown();
      } else if (sessionData.status === 'countdown') {
        handleCountdown(sessionData);
      } else if (sessionData.status === 'active') {
        handleActiveGame(sessionData);
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
  }, [gameId, currentUserId]);

  const startCountdown = async () => {
    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ 
          status: 'countdown',
          countdown_started_at: new Date().toISOString()
        })
        .eq("id", gameId);

      if (error) throw error;
    } catch (error) {
      console.error("Error starting countdown:", error);
    }
  };

  const handleCountdown = (session: GameSession) => {
    if (!session.countdown_started_at) return;
    
    const countdownStart = new Date(session.countdown_started_at).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - countdownStart) / 1000);
    const remaining = Math.max(0, 5 - elapsed);
    
    setCountdownTime(remaining);
    
    if (remaining === 0) {
      startGame();
    }
  };

  const handleActiveGame = (session: GameSession) => {
    if (!session.game_started_at) return;
    
    const gameStart = new Date(session.game_started_at).getTime();
    const now = new Date().getTime();
    const gameElapsed = Math.floor((now - gameStart) / 1000);
    const gameRemaining = Math.max(0, session.time_limit - gameElapsed);
    
    setGameTimeLeft(gameRemaining);
    
    // Handle turn timing
    if (isMyTurn) {
      setTurnStartTime(new Date());
      setTurnTimeLeft(session.turn_time_limit);
    }
    
    // Check if game should end due to time limit
    if (gameRemaining === 0) {
      endGame();
    }
  };

  const startGame = async () => {
    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          status: 'active',
          game_started_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (error) throw error;
      
      await playSound('gameStart');
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const endGame = async () => {
    if (!gameSession) return;
    
    try {
      // Determine winner based on scores
      let winnerId = null;
      if (gameSession.player1_score > gameSession.player2_score) {
        winnerId = gameSession.player1_id;
      } else if (gameSession.player2_score > gameSession.player1_score) {
        winnerId = gameSession.player2_id;
      }
      // If scores are equal, it's a draw (winnerId remains null)

      const { error } = await supabase
        .from("game_sessions")
        .update({
          status: 'completed',
          winner_id: winnerId,
          ended_at: new Date().toISOString()
        })
        .eq("id", gameId);

      if (error) throw error;

      // Update player statistics
      const isWinner = winnerId === currentUserId;
      const isDraw = winnerId === null;
      const currentPlayerScore = gameSession.player1_id === currentUserId ? 
        gameSession.player1_score : gameSession.player2_score;

      await supabase.rpc("update_user_stats_after_game", {
        user_id: currentUserId,
        credits_earned: currentPlayerScore,
        is_winner: isWinner,
        is_draw: isDraw,
        game_mode_param: gameSession.game_mode
      });

      if (isWinner) {
        await playSound('win');
        addGameMessage("🎉 You won! Great job!");
      } else if (isDraw) {
        await playSound('draw');
        addGameMessage("🤝 It's a draw! Well played!");
      } else {
        await playSound('lose');
        addGameMessage("😔 You lost this time. Better luck next round!");
      }

    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  const handleSubmitWord = async () => {
    if (!gameSession || !userInput.trim() || submitting || !isMyTurn) return;

    const word = userInput.toLowerCase().trim();
    const lastWord = getLastWord();
    
    // Validate word based on game mode
    const isValid = isValidWord(word, gameSession.game_mode, gameSession.category, lastWord, gameSession.words_used);
    
    if (!isValid) {
      if (gameSession.game_mode === 'wordchain' && lastWord) {
        const requiredLetter = lastWord[lastWord.length - 1].toUpperCase();
        toast({
          title: "Invalid Word",
          description: `Word must start with "${requiredLetter}" and be a valid English word`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid Word",
          description: "Please enter a valid word for this category",
          variant: "destructive",
        });
      }
      return;
    }

    const success = await submitWord(
      word,
      gameSession,
      gameId,
      currentUserId,
      turnStartTime,
      (submittedWord, points) => {
        setUserInput("");
        addGameMessage(`You played "${submittedWord}" for ${points} credits!`);
        playSound('correct');
      }
    );

    if (success) {
      // Reset turn timer for opponent
      setTurnStartTime(null);
      setTurnTimeLeft(30);
    }
  };

  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev.slice(-4), message]);
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchGameSession();

    const channel = supabase
      .channel('game-session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log("Game session change:", payload);
          if (payload.new) {
            setGameSession(payload.new as GameSession);
            
            const newSession = payload.new as GameSession;
            if (newSession.status === 'countdown') {
              handleCountdown(newSession);
            } else if (newSession.status === 'active') {
              handleActiveGame(newSession);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGameSession]);

  // Countdown timer
  useEffect(() => {
    if (countdownTime > 0) {
      const timer = setTimeout(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdownTime]);

  // Game timer
  useEffect(() => {
    if (gameTimeLeft > 0 && gameSession?.status === 'active') {
      const timer = setTimeout(() => {
        setGameTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            endGame();
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameTimeLeft, gameSession?.status]);

  // Turn timer
  useEffect(() => {
    if (isMyTurn && turnTimeLeft > 0 && gameSession?.status === 'active') {
      const timer = setTimeout(() => {
        setTurnTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            // Auto-skip turn if time runs out
            handleSubmitWord();
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, turnTimeLeft, gameSession?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (!gameSession || !currentPlayerProfile || !opponentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Game not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">
            {gameSession.game_mode === 'wordchain' ? 'Word Chain Battle' : 'Category Battle'}
          </h1>
        </div>

        {/* Game Countdown */}
        {countdownTime > 0 && (
          <GameCountdown 
            countdownTime={countdownTime}
            isMyTurn={isMyTurn}
            opponentName={opponentProfile.display_name || opponentProfile.username}
          />
        )}

        {/* Game Status */}
        <GameStatus
          currentPlayerName={currentPlayerProfile.display_name || currentPlayerProfile.username}
          opponentName={opponentProfile.display_name || opponentProfile.username}
          myScore={gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score}
          opponentScore={gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score}
          gameStatus={gameSession.status}
          isMyTurn={isMyTurn}
          gameTimeLeft={gameTimeLeft}
          countdownTime={countdownTime}
        />

        {/* Game Controls */}
        {gameSession.status === 'active' && countdownTime === 0 && (
          <GameControls
            gameMode={gameSession.game_mode}
            category={gameSession.category}
            lastWord={getLastWord()}
            isMyTurn={isMyTurn}
            userInput={userInput}
            setUserInput={setUserInput}
            onSubmitWord={handleSubmitWord}
            submitting={submitting}
            timeLeft={turnTimeLeft}
            opponentName={opponentProfile.display_name || opponentProfile.username}
          />
        )}

        {/* Words Used */}
        <WordsUsed wordsUsed={gameSession.words_used} />

        {/* Game Messages */}
        <GameMessages messages={gameMessages} />

        {/* Game Rules */}
        <GameRules gameMode={gameSession.game_mode} category={gameSession.category} />
      </div>
    </div>
  );
};

export default MultiplayerGameRoom;
