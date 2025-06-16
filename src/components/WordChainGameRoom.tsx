
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Trophy, Target, Clock, Link } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface WordChainGameRoomProps {
  onBack: () => void;
}

const WordChainGameRoom = ({ onBack }: WordChainGameRoomProps) => {
  const [currentWord, setCurrentWord] = useState("WORD");
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
  const [computerResponse, setComputerResponse] = useState("");
  const [showComputerResponse, setShowComputerResponse] = useState(false);
  const { playSound } = useSoundEffects();

  // Common English words for computer responses
  const commonWords = [
    "apple", "elephant", "tiger", "rain", "night", "tree", "egg", "gold", "dog", "game",
    "mouse", "sun", "net", "top", "pen", "note", "earth", "hat", "table", "energy",
    "yellow", "water", "road", "dance", "eye", "egg", "green", "nest", "time", "end",
    "door", "rock", "key", "yarn", "new", "wind", "duck", "king", "garden", "north"
  ];

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore_wordchain');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

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

  const isValidEnglishWord = (word: string): boolean => {
    // Basic validation - in a real app, you'd use a proper dictionary API
    const validWords = [
      ...commonWords,
      "cat", "bat", "rat", "hat", "mat", "fat", "sat", "pat", "vat", "chat",
      "dog", "log", "fog", "hog", "jog", "cog", "bog", "frog", "blog", "clog",
      "car", "bar", "far", "jar", "tar", "war", "star", "scar", "char", "czar",
      "run", "sun", "fun", "gun", "bun", "nun", "pun", "stun", "spun", "shun",
      "book", "look", "took", "cook", "hook", "nook", "brook", "crook", "shook",
      "home", "dome", "tome", "some", "come", "rome", "chrome", "genome",
      "play", "way", "day", "say", "may", "bay", "lay", "pay", "gay", "hay",
      "love", "dove", "above", "glove", "shove", "grove", "drove", "stove",
      "time", "lime", "dime", "mime", "prime", "crime", "chime", "rhyme",
      "water", "later", "greater", "theater", "sweater", "crater", "plater"
    ];
    return validWords.includes(word.toLowerCase()) || word.length >= 3;
  };

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
    setShowComputerResponse(false);
    setCurrentWord("WORD");
  };

  const generateComputerResponse = useCallback((lastLetter: string) => {
    const possibleWords = commonWords.filter(word => 
      word.toLowerCase().startsWith(lastLetter.toLowerCase()) && 
      !usedWords.includes(word)
    );
    
    if (possibleWords.length > 0) {
      const computerWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
      setComputerResponse(computerWord);
      setUsedWords(prev => [...prev, computerWord]);
      setShowComputerResponse(true);
      
      setTimeout(() => {
        setCurrentWord(computerWord.toUpperCase());
        setShowComputerResponse(false);
      }, 2000);
    } else {
      // Generate a random word if no matches
      const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
      setCurrentWord(randomWord.toUpperCase());
    }
  }, [usedWords]);

  const submitWord = async () => {
    if (!userInput.trim() || !gameActive) return;

    const word = userInput.toLowerCase().trim();
    const lastLetterOfCurrent = currentWord[currentWord.length - 1].toLowerCase();
    const firstLetterOfInput = word[0].toLowerCase();

    // Check if word starts with the last letter of current word
    if (firstLetterOfInput === lastLetterOfCurrent && 
        isValidEnglishWord(word) && 
        !usedWords.includes(word)) {
      
      await playSound('correct');
      const points = word.length * 10 + (streak * 5);
      setScore(prev => prev + points);
      setUsedWords(prev => [...prev, word]);
      setStreak(prev => prev + 1);
      setFeedback(`Correct! +${points} points`);
      
      // Generate computer response
      const lastLetter = word[word.length - 1];
      generateComputerResponse(lastLetter);
      
    } else {
      await playSound('incorrect');
      setStreak(0);
      if (usedWords.includes(word)) {
        setFeedback("Word already used!");
      } else if (firstLetterOfInput !== lastLetterOfCurrent) {
        setFeedback(`Word must start with "${lastLetterOfCurrent.toUpperCase()}"`);
      } else {
        setFeedback("Invalid word!");
      }
    }

    setUserInput("");
    setTimeout(() => setFeedback(""), 2000);
  };

  const endGame = async () => {
    setGameActive(false);
    setGameOver(true);
    
    if (score > highScore) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem('highScore_wordchain', score.toString());
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
    setCurrentWord("WORD");
    setUserInput("");
    setShowComputerResponse(false);
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
          <h1 className="text-xl sm:text-2xl font-bold gradient-text flex items-center gap-2">
            <Link className="h-6 w-6" />
            Word Chain Challenge
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
              {!gameActive && !gameOver && "Ready for Word Chain?"}
              {gameActive && "Build the Word Chain!"}
              {gameOver && "Game Over!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!gameActive && !gameOver && (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Create word chains! Each word must start with the last letter of the previous word.
                </p>
                <Button onClick={startGame} className="bg-gradient-battle hover:opacity-90">
                  Start Word Chain
                </Button>
              </div>
            )}

            {gameActive && (
              <>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current word:</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {currentWord}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your word must start with "{currentWord[currentWord.length - 1]}"
                    </p>
                  </div>
                  
                  {showComputerResponse && (
                    <div className="animate-fade-in">
                      <p className="text-sm text-muted-foreground mb-2">Computer plays:</p>
                      <Badge variant="outline" className="text-lg px-4 py-2 border-blue-500">
                        {computerResponse}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && submitWord()}
                      placeholder="Enter your word..."
                      className="bg-input"
                    />
                    <Button onClick={submitWord} disabled={!userInput.trim()}>
                      Submit
                    </Button>
                  </div>

                  {feedback && (
                    <p className={`text-sm font-medium ${
                      feedback.includes("Correct") ? "text-green-500" : "text-red-500"
                    }`}>
                      {feedback}
                    </p>
                  )}
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
              <CardTitle className="text-sm">Word Chain ({usedWords.length})</CardTitle>
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

export default WordChainGameRoom;
