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
  game_mode?: string;
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

  // Word database for category mode
  const wordDatabase: Record<string, string[]> = {
    "Animals": [
      "dog", "cat", "elephant", "lion", "tiger", "bear", "zebra", "giraffe", "hippopotamus", "rhinoceros",
      "kangaroo", "koala", "panda", "wolf", "fox", "deer", "moose", "buffalo", "antelope", "leopard",
      "cheetah", "crocodile", "alligator", "lizard", "snake", "cobra", "python", "viper", "turtle", "tortoise",
      "frog", "toad", "salamander", "newt", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish",
      "crab", "lobster", "shrimp", "starfish", "clam", "snail", "slug", "ant", "bee", "wasp", "butterfly",
      "moth", "spider", "scorpion", "bat", "rat", "mouse", "hamster", "guinea pig", "horse", "donkey",
      "camel", "llama", "alpaca", "pig", "cow", "goat", "sheep", "chicken", "duck", "goose", "turkey",
      "peacock", "eagle", "hawk", "falcon", "owl", "parrot", "pigeon", "sparrow", "penguin", "flamingo",
      "seal", "walrus", "otter", "beaver", "platypus", "porcupine", "hedgehog", "armadillo", "aardvark",
      "chimpanzee", "gorilla", "orangutan", "baboon", "lemur", "meerkat", "mongoose", "raccoon", "skunk"
    ],
    "Fruits": [
      "apple", "banana", "orange", "grape", "strawberry", "blueberry", "pineapple", "mango", "papaya", "kiwi",
      "peach", "pear", "cherry", "plum", "watermelon", "cantaloupe", "coconut", "lemon", "lime", "avocado",
      "apricot", "nectarine", "blackberry", "raspberry", "cranberry", "pomegranate", "fig", "guava", "passionfruit", "dragonfruit",
      "jackfruit", "durian", "lychee", "longan", "tamarind", "starfruit", "rambutan", "soursop", "custard apple", "mulberry",
      "boysenberry", "gooseberry", "elderberry", "acerola", "persimmon", "quince", "jabuticaba", "sapodilla", "loquat", "medlar"
    ],
    "Countries": [
      "usa", "canada", "mexico", "brazil", "argentina", "chile", "france", "germany", "italy", "spain",
      "portugal", "england", "ireland", "scotland", "norway", "sweden", "finland", "russia", "china", "japan",
      "india", "thailand", "vietnam", "australia", "egypt", "nigeria", "kenya", "south africa", "morocco", "turkey",
      "greece", "poland", "ukraine", "romania", "hungary", "czech republic", "slovakia", "bulgaria", "croatia", "serbia"
    ],
    "Colors": [
      "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
      "gray", "violet", "indigo", "turquoise", "magenta", "cyan", "lime", "maroon", "navy", "olive",
      "teal", "coral", "salmon", "peach", "beige", "ivory", "lavender", "tan", "gold", "silver",
      "bronze", "amber", "charcoal", "mint", "plum", "crimson", "burgundy", "mustard", "aquamarine", "periwinkle"
    ],
    "Sports": [
      "football", "basketball", "tennis", "swimming", "baseball", "volleyball", "hockey", "golf", "boxing", "wrestling",
      "running", "cycling", "skiing", "surfing", "climbing", "badminton", "cricket", "rugby", "soccer", "racing",
      "table tennis", "handball", "squash", "judo", "karate", "taekwondo", "archery", "fencing", "gymnastics", "equestrian",
      "skateboarding", "snowboarding", "bobsledding", "luge", "biathlon", "triathlon", "pentathlon", "rowing", "canoeing", "kayaking"
    ],
    "Food": [
      "pizza", "burger", "sushi", "pasta", "salad", "soup", "sandwich", "tacos", "rice", "bread",
      "cheese", "chicken", "beef", "fish", "vegetables", "noodles", "curry", "steak", "pancakes", "waffles",
      "shawarma", "hummus", "falafel", "dimsum", "ramen", "pho", "biryani", "naan", "butter chicken", "shakshuka",
      "paella", "empanada", "enchilada", "lasagna", "risotto", "gnocchi", "dumplings", "kimchi", "bibimbap", "ceviche"
    ],
    "Movies": [
      "avatar", "titanic", "inception", "matrix", "gladiator", "jaws", "rocky", "alien", "batman", "superman",
      "avengers", "frozen", "shrek", "finding nemo", "toy story", "cars", "up", "coco", "moana", "zootopia"
    ]
  };

  // Common English words for WordChain mode (simplified list)
  const englishWords = [
    "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again", "agent", "agree",
    "ahead", "alarm", "album", "alert", "alien", "align", "alike", "alive", "allow", "alone", "along", "alter",
    "amber", "amend", "among", "anger", "angle", "angry", "apart", "apple", "apply", "arena", "argue", "arise",
    "array", "arrow", "aside", "asset", "avoid", "awake", "award", "aware", "badly", "baker", "bases", "basic",
    "beach", "began", "begin", "being", "below", "bench", "billy", "birth", "black", "blame", "blind", "block",
    "blood", "board", "boast", "bobby", "boost", "booth", "bound", "brain", "brand", "brass", "brave", "bread",
    "break", "breed", "brief", "bring", "broad", "broke", "brown", "build", "built", "buyer", "cable", "cake",
    "calm", "came", "canal", "candy", "cape", "card", "care", "carry", "case", "cash", "cast", "catch",
    "cause", "chain", "chair", "chaos", "charm", "chart", "chase", "cheap", "check", "cheese", "chess", "chest",
    "child", "china", "chose", "civil", "claim", "class", "clean", "clear", "click", "climb", "clock", "close",
    "cloud", "coach", "coast", "could", "count", "court", "cover", "craft", "crash", "crazy", "cream", "crime",
    "cross", "crowd", "crown", "crude", "curve", "cycle", "daily", "damage", "dance", "date", "deal", "death",
    "debt", "delay", "depth", "doing", "doubt", "dozen", "draft", "drama", "drank", "draw", "dream", "dress",
    "drill", "drink", "drive", "drove", "dying", "eager", "early", "earth", "eight", "elite", "empty", "enemy",
    "enjoy", "enter", "entry", "equal", "error", "event", "every", "exact", "exist", "extra", "faith", "false",
    "fault", "fiber", "field", "fifth", "fifty", "fight", "final", "first", "fixed", "flash", "fleet", "floor",
    "fluid", "focus", "force", "forth", "forty", "forum", "found", "frame", "frank", "fraud", "fresh", "front",
    "fruit", "fully", "funny", "giant", "given", "glass", "globe", "going", "grace", "grade", "grand", "grant",
    "grass", "grave", "great", "green", "gross", "group", "grown", "guard", "guess", "guest", "guide", "happy",
    "harry", "heart", "heavy", "hence", "henry", "horse", "hotel", "house", "human", "ideal", "image", "index",
    "inner", "input", "issue", "japan", "jimmy", "joint", "jones", "judge", "known", "label", "large", "laser",
    "later", "laugh", "layer", "learn", "lease", "least", "leave", "legal", "level", "lewis", "light", "limit",
    "links", "lives", "local", "loose", "lower", "lucky", "lunch", "lying", "magic", "major", "maker", "march",
    "maria", "match", "maybe", "mayor", "meant", "media", "metal", "might", "minor", "minus", "mixed", "model",
    "money", "month", "moral", "motor", "mount", "mouse", "mouth", "moved", "movie", "music", "needs", "never",
    "newly", "night", "noise", "north", "noted", "novel", "nurse", "occur", "ocean", "offer", "often", "order",
    "other", "ought", "paint", "panel", "paper", "party", "peace", "peter", "phase", "phone", "photo", "piano",
    "piece", "pilot", "pitch", "place", "plain", "plane", "plant", "plate", "point", "pound", "power", "press",
    "price", "pride", "prime", "print", "prior", "prize", "proof", "proud", "prove", "queen", "quick", "quiet",
    "quite", "radio", "raise", "range", "rapid", "ratio", "reach", "ready", "realm", "rebel", "refer", "relax",
    "repay", "reply", "right", "rigid", "rival", "river", "robin", "roger", "roman", "rough", "round", "route",
    "royal", "rural", "scale", "scene", "scope", "score", "sense", "serve", "seven", "shall", "shape", "share",
    "sharp", "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "short", "shown", "sight",
    "silly", "since", "sixth", "sixty", "sized", "skill", "sleep", "slide", "small", "smart", "smile", "smith",
    "smoke", "snake", "snow", "social", "solid", "solve", "sorry", "sound", "south", "space", "spare", "speak",
    "speed", "spend", "spent", "split", "spoke", "sport", "staff", "stage", "stake", "stand", "start", "state",
    "steam", "steel", "steep", "steer", "stem", "step", "stick", "still", "stock", "stone", "stood", "store",
    "storm", "story", "strip", "stuck", "study", "stuff", "style", "sugar", "suite", "super", "sweet", "table",
    "taken", "taste", "taxes", "teach", "teeth", "terry", "thank", "theft", "their", "theme", "there", "these",
    "thick", "thing", "think", "third", "those", "three", "threw", "throw", "thumb", "tiger", "tight", "timer",
    "tired", "title", "today", "topic", "total", "touch", "tough", "tower", "track", "trade", "train", "treat",
    "trend", "trial", "tribe", "trick", "tried", "tries", "truck", "truly", "trunk", "trust", "truth", "twice",
    "uncle", "under", "undue", "union", "unity", "until", "upper", "upset", "urban", "usage", "usual", "valid",
    "value", "video", "virus", "visit", "vital", "vocal", "voice", "waste", "watch", "water", "wheel", "where",
    "which", "while", "white", "whole", "whose", "woman", "women", "world", "worry", "worse", "worst", "worth",
    "would", "write", "wrong", "wrote", "young", "youth"
  ];

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

  const isValidWord = (word: string): boolean => {
    if (gameSession?.game_mode === "wordchain") {
      // For word chain, check if it's a valid English word
      return englishWords.includes(word.toLowerCase());
    } else {
      // For category mode, check if it's in the category
      const validWords = wordDatabase[gameSession?.category || ""] || [];
      return validWords.includes(word.toLowerCase());
    }
  };

  const isValidChain = (word: string): boolean => {
    if (gameSession?.game_mode !== "wordchain") {
      return true; // Category mode doesn't need chain validation
    }
    
    if (gameSession.words_used.length === 0) {
      return true; // First word can be anything
    }
    
    const lastWord = gameSession.words_used[gameSession.words_used.length - 1];
    const lastLetter = lastWord[lastWord.length - 1].toLowerCase();
    const firstLetter = word[0].toLowerCase();
    
    return lastLetter === firstLetter;
  };

  const submitWord = async () => {
    if (!currentWord.trim() || !gameSession) return;

    const word = currentWord.toLowerCase().trim();
    
    // Check if word is valid for the game mode
    if (!isValidWord(word)) {
      const errorMsg = gameSession.game_mode === "wordchain" 
        ? `"${currentWord}" is not a valid English word`
        : `"${currentWord}" is not a valid ${gameSession.category.toLowerCase()}`;
      
      toast({
        title: "Invalid Word!",
        description: errorMsg,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Check word chain for WordChain mode
    if (!isValidChain(word)) {
      const lastWord = gameSession.words_used[gameSession.words_used.length - 1];
      const expectedLetter = lastWord[lastWord.length - 1].toUpperCase();
      
      toast({
        title: "Invalid Chain!",
        description: `Word must start with "${expectedLetter}"`,
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
  
  const getGameTitle = () => {
    if (gameSession.game_mode === "wordchain") {
      return "Word Chain Battle";
    }
    return `${gameSession.category} Battle`;
  };

  const getPlaceholder = () => {
    if (gameSession.game_mode === "wordchain") {
      if (gameSession.words_used.length === 0) {
        return "Enter any English word...";
      }
      const lastWord = gameSession.words_used[gameSession.words_used.length - 1];
      const nextLetter = lastWord[lastWord.length - 1].toUpperCase();
      return `Enter a word starting with "${nextLetter}"...`;
    }
    return `Enter a ${gameSession.category.toLowerCase().slice(0, -1)}...`;
  };

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
              <p><strong>Game Mode:</strong> {gameSession.game_mode === "wordchain" ? "Word Chain" : "Category Naming"}</p>
              {gameSession.game_mode !== "wordchain" && (
                <p><strong>Category:</strong> {gameSession.category}</p>
              )}
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
              {getGameTitle()}
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
                New Game
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
            {getGameTitle()}
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
                {myScore}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Users className="h-4 sm:h-6 w-4 sm:w-6 text-red-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {opponentScore}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Opponent</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Turn - Mobile Responsive */}
        <Card className="bg-gradient-card border-primary/40 mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              {isMyTurn ? (
                <>
                  <Crown className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-base">Your Turn!</span>
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
                onKeyPress={(e) => e.key === 'Enter' && isMyTurn && submitWord()}
                placeholder={getPlaceholder()}
                className="text-sm sm:text-lg py-3 sm:py-6 bg-input border-border focus:border-primary"
                disabled={!gameActive || !isMyTurn}
              />
              <Button 
                onClick={submitWord}
                disabled={!gameActive || !isMyTurn || !currentWord.trim()}
                className="px-4 sm:px-8 py-3 sm:py-6 bg-gradient-battle hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <Badge variant={isMyTurn ? "default" : "secondary"} className="text-xs sm:text-sm">
                {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
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
