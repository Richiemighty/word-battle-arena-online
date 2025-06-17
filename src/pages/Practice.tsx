
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Target, Link } from "lucide-react";
import GameModeSelection, { GameMode } from "@/components/GameModeSelection";
import CategorySelection from "@/components/CategorySelection";
import PracticeGameRoom from "@/components/PracticeGameRoom";
import WordChainGameRoom from "@/components/WordChainGameRoom";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { toast } from "@/hooks/use-toast";

const Practice = () => {
  const [gameState, setGameState] = useState<'practice' | 'mode-selection' | 'category-selection' | 'practice-game' | 'wordchain'>('practice');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const { playSound } = useSoundEffects();

  const practiceCategories = [
    { id: "animals", name: "Animals" },
    { id: "fruits", name: "Fruits" },
    { id: "countries", name: "Countries" },
    { id: "colors", name: "Colors" },
    { id: "sports", name: "Sports" },
    { id: "food", name: "Food" }
  ];

  const startPracticeGame = async () => {
    await playSound('click');
    setGameState('mode-selection');
  };

  const handleGameModeSelect = async (mode: GameMode) => {
    await playSound('click');
    setSelectedGameMode(mode);
    
    if (mode === 'wordchain') {
      setGameState('wordchain');
    } else {
      setGameState('category-selection');
    }
  };

  const handleCategorySelect = async (category: {id: string, name: string}) => {
    await playSound('click');
    setSelectedCategory(category);
    setGameState('practice-game');
  };

  const findRandomMatch = async () => {
    await playSound('click');
    toast({
      title: "Finding Match",
      description: "Looking for online players...",
    });
    // TODO: Implement random matchmaking
  };

  const handleBackToPractice = () => {
    setGameState('practice');
    setSelectedGameMode(null);
    setSelectedCategory(null);
  };

  const handleBackToModeSelection = () => {
    setGameState('mode-selection');
    setSelectedCategory(null);
  };

  if (gameState === 'mode-selection') {
    return (
      <GameModeSelection 
        onSelectMode={handleGameModeSelect}
        onBack={handleBackToPractice}
      />
    );
  }

  if (gameState === 'category-selection') {
    return (
      <CategorySelection
        categories={practiceCategories}
        onSelectCategory={handleCategorySelect}
        onBack={handleBackToModeSelection}
        title="Choose Category for Practice"
      />
    );
  }

  if (gameState === 'practice-game' && selectedCategory) {
    return (
      <PracticeGameRoom 
        category={selectedCategory}
        onBack={handleBackToPractice}
      />
    );
  }

  if (gameState === 'wordchain') {
    return (
      <WordChainGameRoom 
        onBack={handleBackToPractice}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-6 text-center">
          Practice Against Computer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-card border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Gamepad2 className="h-4 sm:h-5 w-4 sm:w-5" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                Choose between Category Naming and Word Chain modes. Perfect for warming up!
              </p>
              <Button onClick={startPracticeGame} className="w-full bg-gradient-battle hover:opacity-90 text-sm">
                Start Practice Game
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                Multiplayer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                Challenge your friends or find random opponents online!
              </p>
              <Button onClick={findRandomMatch} className="w-full bg-gradient-battle hover:opacity-90 text-sm">
                Find Random Match
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Mode Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-card border-purple-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Link className="h-4 w-4" />
                Word Chain Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>• Create word chains with connected letters</p>
              <p>• Each word starts with the last letter of previous word</p>
              <p>• 15 credits per word + bonuses</p>
              <p>• 3-minute time limit</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-orange-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                Category Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>• Name items in specific categories</p>
              <p>• Points based on word length and speed</p>
              <p>• Various category themes available</p>
              <p>• Perfect for vocabulary building</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Practice;
