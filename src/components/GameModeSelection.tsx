
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Link, Target, Zap } from "lucide-react";

export type GameMode = 'category' | 'wordchain';

interface GameModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

const GameModeSelection = ({ onSelectMode, onBack }: GameModeSelectionProps) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">
            Choose Game Mode
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="bg-gradient-card border-primary/40 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleModeSelect('category')}
          >
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Category Naming</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Name items from a specific category like animals, fruits, or countries.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Choose from 6 categories</p>
                <p>• Time-based scoring</p>
                <p>• Category-specific words only</p>
              </div>
              <Button className="w-full bg-gradient-battle hover:opacity-90">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play Category Mode
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-card border-accent/40 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleModeSelect('wordchain')}
          >
            <CardHeader className="text-center">
              <Link className="h-12 w-12 text-accent mx-auto mb-2" />
              <CardTitle className="text-lg">Word Chain</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Create word chains where each word starts with the last letter of the previous word.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Any valid English word</p>
                <p>• Chain-based gameplay</p>
                <p>• Dictionary validation</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-accent to-accent/80 hover:opacity-90">
                <Zap className="h-4 w-4 mr-2" />
                Play Word Chain
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;
