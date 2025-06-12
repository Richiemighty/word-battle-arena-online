
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import CategorySelection, { Category } from "@/components/CategorySelection";
import GameArena from "@/components/GameArena";

type GameState = 'landing' |'category' | 'game';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleStartGame = () => {
    setGameState('category');
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setGameState('game');
  };

  const handleBackToLanding = () => {
    setGameState('landing');
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setGameState('category');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen">
      {gameState === 'landing' && (
        <LandingPage onStartGame={handleStartGame} />
      )}
      
      {gameState === 'category' && (
        <CategorySelection 
          onSelectCategory={handleSelectCategory}
          onBack={handleBackToLanding}
        />
      )}
      
      {gameState === 'game' && selectedCategory && (
        <GameArena 
          category={selectedCategory}
          onBack={handleBackToCategories}
        />
      )}
    </div>
  );
};

export default Index;
