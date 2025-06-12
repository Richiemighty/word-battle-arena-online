
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Trophy, Target } from "lucide-react";
import { Category } from "./CategorySelection";
import { toast } from "@/hooks/use-toast";

interface GameArenaProps {
  category: Category;
  onBack: () => void;
}

const GameArena = ({ category, onBack }: GameArenaProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample word databases for each category
  const wordDatabase: Record<string, string[]> = {
    animals: ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'kangaroo', 'dolphin', 'whale', 'shark', 'eagle', 'hawk', 'owl', 'rabbit', 'fox', 'wolf', 'bear', 'deer'],
    fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'pineapple', 'mango', 'papaya', 'kiwi', 'peach', 'pear', 'cherry', 'plum', 'watermelon', 'cantaloupe', 'coconut', 'lemon', 'lime', 'avocado'],
    countries: ['france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india', 'china', 'russia', 'egypt', 'nigeria', 'argentina', 'chile', 'norway', 'sweden', 'thailand', 'vietnam'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'violet', 'indigo', 'turquoise', 'magenta', 'cyan', 'lime', 'maroon', 'navy', 'olive'],
    sports: ['football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling', 'running', 'cycling', 'skiing', 'surfing', 'climbing', 'badminton', 'cricket', 'rugby', 'soccer', 'racing'],
    food: ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread', 'cheese', 'chicken', 'beef', 'fish', 'vegetables', 'noodles', 'curry', 'steak', 'pancakes', 'waffles']
  };

  const validWords = wordDatabase[category.id] || [];

  // Start countdown
  useEffect(() => {
    if (!gameStarted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!gameStarted && countdown === 0) {
      setGameStarted(true);
      setGameActive(true);
      inputRef.current?.focus();
    }
  }, [countdown, gameStarted]);

  // Game timer
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const submitWord = () => {
    if (!currentWord.trim()) return;

    const word = currentWord.toLowerCase().trim();
    
    // Check if word is valid for this category
    if (!validWords.includes(word)) {
      toast({
        title: "Invalid Word!",
        description: `"${currentWord}" is not a valid ${category.name.toLowerCase().slice(0, -1)}. Try again!`,
        variant: "destructive"
      });
      setCurrentWord("");
      return;
    }

    // Check if word was already used
    if (usedWords.includes(word)) {
      toast({
        title: "Word Already Used!",
        description: `"${currentWord}" has already been used. Think of a new one!`,
        variant: "destructive"
      });
      setCurrentWord("");
      return;
    }

    // Calculate score based on time remaining
    const timeBonus = Math.max(1, Math.floor(timeLeft / 5));
    const wordScore = 10 + timeBonus;
    
    setUsedWords([...usedWords, word]);
    setScore(score + wordScore);
    setCurrentWord("");
    setTimeLeft(30); // Reset timer for next word
    
    toast({
      title: "Great Word!",
      description: `+${wordScore} points! Time bonus: +${timeBonus}`,
    });

    inputRef.current?.focus();
  };

  const endGame = () => {
    setGameActive(false);
    toast({
      title: "Game Over!",
      description: `Final Score: ${score} points with ${usedWords.length} words!`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{category.icon}</div>
            <CardTitle className="text-3xl font-bold gradient-text">
              {category.name} Battle
            </CardTitle>
            <p className="text-muted-foreground">Get ready to battle!</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            {category.name} Battle Arena
          </h1>
          <div className="w-24" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-card border-accent/40">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{timeLeft}s</div>
              <p className="text-sm text-muted-foreground">Time Left</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/40">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{score}</div>
              <p className="text-sm text-muted-foreground">Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{usedWords.length}</div>
              <p className="text-sm text-muted-foreground">Words Found</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Input */}
        <Card className="bg-gradient-card border-primary/40 mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Name a {category.name.toLowerCase().slice(0, -1)}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                ref={inputRef}
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter a ${category.name.toLowerCase().slice(0, -1)}...`}
                className="text-lg py-6 bg-input border-border focus:border-primary"
                disabled={!gameActive}
              />
              <Button 
                onClick={submitWord}
                disabled={!gameActive || !currentWord.trim()}
                className="px-8 py-6 bg-gradient-battle hover:opacity-90"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Type fast for bonus points! {30 - timeLeft < 5 ? "⚡ Speed bonus active!" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Used Words */}
        {usedWords.length > 0 && (
          <Card className="bg-gradient-card border-secondary/40">
            <CardHeader>
              <CardTitle>Words Used ({usedWords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {usedWords.map((word, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
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

export default GameArena;
