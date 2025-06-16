
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Trophy, Target, Clock } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface PracticeGameRoomProps {
  category: { id: string; name: string };
  onBack: () => void;
}

const PracticeGameRoom = ({ category, onBack }: PracticeGameRoomProps) => {
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [computerWord, setComputerWord] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showComputerThinking, setShowComputerThinking] = useState(false);
  const { playSound } = useSoundEffects();

  // Category word lists - same as multiplayer
  const wordDatabase: Record<string, string[]> = {
    animals: [
      "dog", "cat", "elephant", "lion", "tiger", "bear", "zebra", "giraffe", "hippopotamus", "rhinoceros",
      "kangaroo", "koala", "panda", "wolf", "fox", "deer", "moose", "buffalo", "antelope", "leopard",
      "cheetah", "crocodile", "alligator", "lizard", "snake", "cobra", "python", "viper", "turtle", "tortoise",
      "frog", "toad", "whale", "dolphin", "shark", "octopus", "crab", "lobster", "ant", "bee", "butterfly",
      "spider", "bat", "mouse", "horse", "cow", "pig", "chicken", "duck", "goose", "eagle", "owl", "parrot"
    ],
    fruits: [
      "apple", "banana", "orange", "grape", "strawberry", "blueberry", "pineapple", "mango", "papaya", "kiwi",
      "peach", "pear", "cherry", "plum", "watermelon", "cantaloupe", "coconut", "lemon", "lime", "avocado",
      "apricot", "nectarine", "blackberry", "raspberry", "cranberry", "pomegranate", "fig", "guava", "dragonfruit",
      "jackfruit", "lychee", "passion fruit", "starfruit", "persimmon", "tangerine", "grapefruit", "dates"
    ],
    countries: [
      "usa", "canada", "mexico", "brazil", "argentina", "chile", "france", "germany", "italy", "spain",
      "portugal", "england", "ireland", "scotland", "norway", "sweden", "finland", "russia", "china", "japan",
      "india", "thailand", "vietnam", "australia", "egypt", "nigeria", "kenya", "south africa", "morocco", "turkey"
    ],
    colors: [
      "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
      "gray", "violet", "indigo", "turquoise", "magenta", "cyan", "lime", "maroon", "navy", "olive",
      "teal", "coral", "salmon", "peach", "beige", "ivory", "lavender", "tan", "gold", "silver"
    ],
    sports: [
      "football", "basketball", "tennis", "swimming", "baseball", "volleyball", "hockey", "golf", "boxing", "wrestling",
      "running", "cycling", "skiing", "surfing", "climbing", "badminton", "cricket", "rugby", "soccer", "racing",
      "diving", "rowing", "sailing", "archery", "fencing", "gymnastics", "judo", "karate", "polo", "bowling"
    ],
    food: [
      "pizza", "burger", "sushi", "pasta", "salad", "soup", "sandwich", "tacos", "rice", "bread",
      "cheese", "chicken", "beef", "fish", "noodles", "curry", "steak", "pancakes", "waffles", "ice cream",
      "cake", "cookies", "chocolate", "yogurt", "eggs", "bacon", "ham", "turkey", "salmon", "shrimp"
    ]
  };

  const currentWordList = wordDatabase[category.id as keyof typeof wordDatabase] || wordDatabase.animals;

  useEffect(() => {
    const savedHighScore = localStorage.getItem(`highScore_${category.id}`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, [category.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const startGame = async () => {
    await playSound('click');
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setUsedWords([]);
    setFeedback("");
    setStreak(0);
    setIsNewHighScore(false);
    setIsPlayerTurn(true);
    setComputerWord("");
    
    // Computer starts with first word
    generateComputerWord();
  };

  const generateComputerWord = useCallback(() => {
    const availableWords = currentWordList.filter(word => !usedWords.includes(word));
    if (availableWords.length > 0) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      setComputerWord(randomWord);
      setUsedWords(prev => [...prev, randomWord]);
      setIsPlayerTurn(true);
    } else {
      // Computer runs out of words - player wins
      endGame();
    }
  }, [currentWordList, usedWords]);

  const computerRespond = useCallback(() => {
    setShowComputerThinking(true);
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      const availableWords = currentWordList.filter(word => 
        !usedWords.includes(word) && word !== computerWord
      );
      
      if (availableWords.length > 0) {
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setComputerWord(randomWord);
        setUsedWords(prev => [...prev, randomWord]);
        setShowComputerThinking(false);
        setIsPlayerTurn(true);
      } else {
        // Computer runs out of words - player wins bonus points
        setScore(prev => prev + 100);
        setFeedback("Computer ran out of words! Bonus +100 points!");
        endGame();
      }
    }, 2000); // Computer "thinks" for 2 seconds
  }, [currentWordList, usedWords, computerWord]);

  const submitWord = async () => {
    if (!userInput.trim() || !gameActive || !isPlayerTurn) return;

    const word = userInput.toLowerCase().trim();

    // Check if word is valid and from the correct category
    if (!currentWordList.includes(word)) {
      await playSound('incorrect');
      setStreak(0);
      setFeedback(`"${userInput}" is not a valid ${category.name.toLowerCase().slice(0, -1)}!`);
      setUserInput("");
      setTimeout(() => setFeedback(""), 2000);
      return;
    }

    // Check if word was already used
    if (usedWords.includes(word)) {
      await playSound('incorrect');
      setStreak(0);
      setFeedback("Word already used!");
      setUserInput("");
      setTimeout(() => setFeedback(""), 2000);
      return;
    }

    // Valid word
    await playSound('correct');
    const points = word.length * 10 + (streak * 5);
    setScore(prev => prev + points);
    setUsedWords(prev => [...prev, word]);
    setStreak(prev => prev + 1);
    setFeedback(`Correct! +${points} points`);
    setUserInput("");
    
    setTimeout(() => setFeedback(""), 2000);

    // Computer's turn
    computerRespond();
  };

  const endGame = async () => {
    setGameActive(false);
    setGameOver(true);
    
    if (score > highScore) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem(`highScore_${category.id}`, score.toString());
      await playSound('win');
    } else {
      await playSound('lose');
    }
  };

  const resetGame = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setUsedWords([]);
    setFeedback("");
    setStreak(0);
    setIsNewHighScore(false);
    setComputerWord("");
    setUserInput("");
    setIsPlayerTurn(true);
    setShowComputerThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">
            Practice Mode - {category.name}
          </h1>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{score}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{highScore}</div>
              <p className="text-xs text-muted-foreground">High Score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{timeLeft}</div>
              <p className="text-xs text-muted-foreground">Time Left</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Brain className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {!gameActive && !gameOver && "Ready to Practice?"}
              {gameActive && `${category.name} Challenge`}
              {gameOver && "Game Over!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!gameActive && !gameOver && (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Name {category.name.toLowerCase()} with the computer! Take turns naming items from this category.
                </p>
                <Button onClick={startGame} className="bg-gradient-battle hover:opacity-90">
                  Start Practice
                </Button>
              </div>
            )}

            {gameActive && (
              <>
                <div className="text-center space-y-4">
                  {computerWord && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Computer played:</p>
                      <Badge variant="outline" className="text-lg px-4 py-2 border-blue-500">
                        {computerWord}
                      </Badge>
                    </div>
                  )}
                  
                  {showComputerThinking && (
                    <div className="animate-pulse">
                      <p className="text-sm text-muted-foreground mb-2">Computer is thinking...</p>
                      <div className="h-8 bg-muted rounded animate-pulse"></div>
                    </div>
                  )}

                  {isPlayerTurn && !showComputerThinking && (
                    <div className="flex gap-2">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && submitWord()}
                        placeholder={`Enter a ${category.name.toLowerCase().slice(0, -1)}...`}
                        className="bg-input"
                        disabled={!isPlayerTurn}
                      />
                      <Button onClick={submitWord} disabled={!userInput.trim() || !isPlayerTurn}>
                        Submit
                      </Button>
                    </div>
                  )}

                  {feedback && (
                    <p className={`text-sm font-medium ${
                      feedback.includes("Correct") || feedback.includes("Bonus") ? "text-green-500" : "text-red-500"
                    }`}>
                      {feedback}
                    </p>
                  )}

                  <div className="text-center">
                    <Badge variant={isPlayerTurn && !showComputerThinking ? "default" : "secondary"} className="text-sm">
                      {showComputerThinking ? "COMPUTER'S TURN" : isPlayerTurn ? "YOUR TURN" : "WAITING..."}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Progress</span>
                    <span>{timeLeft}s</span>
                  </div>
                  <Progress value={(timeLeft / 120) * 100} className="h-2" />
                </div>
              </>
            )}

            {gameOver && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Final Score: {score}</h3>
                  {isNewHighScore && (
                    <div className="animate-bounce-in">
                      <Badge className="bg-yellow-500 text-black">
                        🎉 New High Score! 🎉
                      </Badge>
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Words used: {usedWords.length}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={startGame} className="bg-gradient-battle hover:opacity-90">
                    Play Again
                  </Button>
                  <Button variant="outline" onClick={resetGame}>
                    New Game
                  </Button>
                  <Button variant="outline" onClick={onBack}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Used Words */}
        {usedWords.length > 0 && (
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-sm">Used Words ({usedWords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {usedWords.map((word, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {word}
                  </Badge>
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
