
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Bot, Crown, RotateCcw, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [newHighScore, setNewHighScore] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [computerThinking, setComputerThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const wordDatabase: Record<string, string[]> = {
    "animals": ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'kangaroo', 'dolphin', 'whale', 'shark', 'eagle', 'owl', 'parrot', 'snake', 'lizard', 'turtle', 'frog', 'rabbit'],
    "fruits": ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple', 'watermelon', 'peach', 'cherry', 'kiwi', 'papaya', 'coconut', 'lemon', 'lime', 'plum', 'apricot', 'blueberry', 'raspberry', 'blackberry'],
    "countries": ['france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india', 'china', 'russia', 'egypt', 'kenya', 'norway', 'sweden', 'thailand', 'vietnam', 'argentina', 'chile'],
    "colors": ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold', 'turquoise', 'magenta', 'cyan', 'maroon', 'navy', 'olive', 'teal'],
    "sports": ['football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling', 'soccer', 'cricket', 'badminton', 'rugby', 'skiing', 'surfing', 'cycling', 'running', 'jumping', 'climbing'],
    "food": ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread', 'chicken', 'beef', 'fish', 'cheese', 'yogurt', 'cake', 'cookie', 'chocolate', 'ice cream', 'noodles']
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

  const submitWord = () => {
    if (!currentWord.trim()) return;

    const word = currentWord.toLowerCase().trim();
    const validWords = wordDatabase[category.id] || [];
    
    // Check if word is valid
    if (!validWords.includes(word)) {
      toast({
        title: "Invalid Word!",
        description: `"${currentWord}" is not a valid ${category.name.toLowerCase()}`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Check if word was already used
    if (usedWords.includes(word)) {
      toast({
        title: "Word Already Used!",
        description: `"${currentWord}" has already been used`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Calculate score (no time pressure in practice mode)
    const wordScore = Math.floor(Math.random() * 10) + 10; // Random bonus between 10-20
    
    setUsedWords(prev => [...prev, word]);
    setPlayerScore(prev => prev + wordScore);
    setCurrentWord("");
    setIsPlayerTurn(false);

    toast({
      title: "Great Word!",
      description: `+${wordScore} points!`,
    });

    // Check if all words are used
    if (usedWords.length + 1 >= (wordDatabase[category.id] || []).length) {
      endGame();
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text text-center">
            Practice: {category.name}
          </h1>
          <div className="w-16 sm:w-24" />
        </div>

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
    </div>
  );
};

export default PracticeGameRoom;
