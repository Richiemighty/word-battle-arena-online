import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Bot, Crown, RotateCcw, Home, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface PracticeGameRoomProps {
  category: {
    id: string;
    name: string;
  };
  onBack: () => void;
}

const PracticeGameRoom = ({ category, onBack }: PracticeGameRoomProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showHighScoreMessage, setShowHighScoreMessage] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [computerThinking, setComputerThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();

  const wordDatabase: Record<string, string[]> = {
    "animals": ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'kangaroo', 'dolphin', 'whale', 'shark', 'eagle', 'owl', 'parrot', 'snake', 'lizard', 'turtle', 'frog', 'rabbit'],
    "fruits": ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple', 'watermelon', 'peach', 'cherry', 'kiwi', 'papaya', 'coconut', 'lemon', 'lime', 'plum', 'apricot', 'blueberry', 'raspberry', 'blackberry'],
    "countries": ['france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india', 'china', 'russia', 'egypt', 'kenya', 'norway', 'sweden', 'thailand', 'vietnam', 'argentina', 'chile'],
    "colors": ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold', 'turquoise', 'magenta', 'cyan', 'maroon', 'navy', 'olive', 'teal'],
    "sports": ['football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling', 'soccer', 'cricket', 'badminton', 'rugby', 'skiing', 'surfing', 'cycling', 'running', 'jumping', 'climbing'],
    "food": ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread', 'chicken', 'beef', 'fish', 'cheese', 'yogurt', 'cake', 'cookie', 'chocolate', 'ice cream', 'noodles']
  };

  const getWordList = () => {
    return wordDatabase[category.id] || [];
  };

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem(`highScore_${category.id}`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Focus input when it's player's turn
    if (isPlayerTurn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [category.id, isPlayerTurn]);

  useEffect(() => {
    // Computer's turn logic
    if (!isPlayerTurn && !gameEnded && !computerThinking) {
      setComputerThinking(true);
      
      const computerTurnTimer = setTimeout(() => {
        makeComputerMove();
        setComputerThinking(false);
      }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds

      return () => clearTimeout(computerTurnTimer);
    }
  }, [isPlayerTurn, gameEnded, computerThinking]);

  const makeComputerMove = () => {
    const availableWords = wordDatabase[category.id] || [];
    const unusedWords = availableWords.filter(word => !usedWords.includes(word));
    
    if (unusedWords.length === 0) {
      endGame();
      return;
    }

    const computerWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
    const computerPoints = Math.floor(Math.random() * 15) + 5; // Random points between 5-20
    
    setUsedWords(prev => [...prev, computerWord]);
    setComputerScore(prev => prev + computerPoints);
    setIsPlayerTurn(true);
    
    toast({
      title: "Computer played!",
      description: `Computer: "${computerWord}" (+${computerPoints} points)`,
    });
  };

  const submitWord = async () => {
    if (!currentWord.trim() || timeLeft <= 0) return;

    const word = currentWord.toLowerCase().trim();
    const wordList = getWordList();
    
    if (usedWords.includes(word)) {
      await playSound('incorrect');
      toast({
        title: "Word already used!",
        description: "Try a different word",
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    if (wordList.includes(word)) {
      const points = Math.max(word.length * 10, 10);
      const newScore = playerScore + points;
      setPlayerScore(newScore);
      setUsedWords([...usedWords, word]);
      await playSound('correct');
      
      // Check for high score
      await checkHighScore(newScore);
      
      toast({
        title: "Correct!",
        description: `+${points} points`,
      });

      // Generate computer response after a short delay
      setTimeout(() => {
        generateComputerWord();
      }, 1000);
    } else {
      await playSound('incorrect');
      toast({
        title: "Invalid word!",
        description: "Word not found in category",
        variant: "destructive",
      });
    }

    setCurrentWord("");
  };

  const generateComputerWord = async () => {
    const wordList = getWordList();
    const availableWords = wordList.filter(w => !usedWords.includes(w));
    
    if (availableWords.length > 0) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      const points = Math.max(randomWord.length * 8, 8); // Computer gets slightly fewer points
      setComputerScore(prev => prev + points);
      setUsedWords(prev => [...prev, randomWord]);
      
      await playSound('notification');
      toast({
        title: "Computer played:",
        description: `"${randomWord}" (+${points} points)`,
      });
    }
  };

  const checkHighScore = async (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(`highScore_${category.id}`, newScore.toString());
      setShowHighScoreMessage(true);
      await playSound('win');
      toast({
        title: "🎉 NEW HIGH SCORE! 🎉",
        description: `Amazing! You scored ${newScore} points!`,
      });
      setTimeout(() => setShowHighScoreMessage(false), 3000);
    }
  };

  const endGame = () => {
    setGameEnded(true);
    
    // Check for new high score
    if (playerScore > highScore) {
      setHighScore(playerScore);
      setNewHighScore(true);
      localStorage.setItem(`highScore_${category.id}`, playerScore.toString());
      
      toast({
        title: "🎉 NEW HIGH SCORE! 🎉",
        description: `Congratulations! You scored ${playerScore} points!`,
      });
    }
  };

  const playAgain = () => {
    setCurrentWord("");
    setPlayerScore(0);
    setComputerScore(0);
    setUsedWords([]);
    setGameEnded(false);
    setNewHighScore(false);
    setIsPlayerTurn(true);
    setComputerThinking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) =>{ if (e.key === 'Enter' && isPlayerTurn) {
      submitWord();
    }
  };

  const resetGame = async () => {
    await playSound('click');
    setPlayerScore(0);
    setComputerScore(0);
    setUsedWords([]);
    setCurrentWord("");
    setTimeLeft(120);
    setGameStarted(false);
    setGameEnded(false);
    setShowHighScoreMessage(false);
  };

  const startGame = async () => {
    await playSound('click');
    setGameStarted(true);
    setTimeLeft(120);
  };

  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameEnded(true);
            setGameStarted(false);
            playSound('lose'); // Add sound when time runs out
            checkHighScore(playerScore);
            return 0;
          }
          if (prev <= 10) {
            playSound('countdown'); // Add countdown sound
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameEnded, playerScore]);

  // Game ended screen
  if (gameEnded) {
    const isWinner = playerScore > computerScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold gradient-text mb-4">
              {isWinner ? "You Won! 🏆" : "Computer Wins!"}
            </CardTitle>
            {newHighScore && (
              <div className="bg-gradient-battle text-white p-3 rounded-lg mb-4 animate-pulse">
                <p className="font-bold">🎉 NEW HIGH SCORE! 🎉</p>
                <p className="text-sm">Previous: {highScore - playerScore} → New: {playerScore}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-lg">Final Scores:</p>
              <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg">
                <span>You: {playerScore}</span>
                <span>Computer: {computerScore}</span>
              </div>
              <p className="text-sm text-muted-foreground">High Score: {highScore}</p>
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
                onClick={onBack}
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
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold gradient-text">
                Practice Mode
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Category: {category.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Card className="bg-gradient-card border-yellow-500/40 p-2 sm:p-3 flex-1 sm:flex-none">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">High Score</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-500">{highScore}</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-card border-primary/40 p-2 sm:p-3 flex-1 sm:flex-none">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className={`text-lg sm:text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* High Score Celebration */}
        {showHighScoreMessage && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/60 mb-6 animate-pulse">
            <CardContent className="p-4 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-2">🎉 NEW HIGH SCORE! 🎉</h2>
              <p className="text-sm sm:text-base text-foreground">Congratulations! You've set a new record!</p>
            </CardContent>
          </Card>
        )}

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Trophy className="h-4 sm:h-6 w-4 sm:w-6 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">{playerScore}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Bot className="h-4 sm:h-6 w-4 sm:w-6 text-red-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">{computerScore}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Computer</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-yellow-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Crown className="h-4 sm:h-6 w-4 sm:w-6 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">{highScore}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">High Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Turn */}
        <Card className="bg-gradient-card border-primary/40 mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              {isPlayerTurn ? (
                <>
                  <Crown className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-base">Your Turn - Name a {category.name.toLowerCase().slice(0, -1)}!</span>
                </>
              ) : (
                <>
                  <Bot className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <span className="text-xs sm:text-base">Computer is thinking...</span>
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
                onKeyPress={handleKeyPress}
                placeholder={`Enter a ${category.name.toLowerCase().slice(0, -1)}...`}
                className="text-sm sm:text-lg py-3 sm:py-6 bg-input border-border focus:border-primary"
                disabled={!isPlayerTurn || computerThinking}
              />
              <Button 
                onClick={submitWord}
                disabled={!isPlayerTurn || !currentWord.trim() || computerThinking}
                className="px-4 sm:px-8 py-3 sm:py-6 bg-gradient-battle hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <Badge variant={isPlayerTurn ? "default" : "secondary"} className="text-xs sm:text-sm">
                {isPlayerTurn ? "YOUR TURN" : computerThinking ? "COMPUTER THINKING..." : "COMPUTER'S TURN"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Used Words */}
        {usedWords.length > 0 && (
          <Card className="bg-gradient-card border-secondary/40">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Words Used ({usedWords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {usedWords.map((word, index) => (
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

      {/* Game Controls - Mobile Responsive */}
      {!gameStarted && !gameEnded && (
        <div className="text-center">
          <Button 
            onClick={startGame}
            size="lg"
            className="bg-gradient-battle hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Start Practice
          </Button>
        </div>
      )}

      {gameEnded && (
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">Practice Complete!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Final Score: {playerScore} points {playerScore > highScore && "(New High Score!)"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={resetGame}
              className="bg-gradient-battle hover:opacity-90 text-sm sm:text-base"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={onBack}
              variant="outline"
              className="text-sm sm:text-base"
            >
              Choose Category
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeGameRoom;
