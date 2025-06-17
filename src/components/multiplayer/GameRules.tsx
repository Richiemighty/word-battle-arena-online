
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameRulesProps {
  gameMode: string;
}

const GameRules = ({ gameMode }: GameRulesProps) => {
  return (
    <Card className="bg-gradient-card mb-6">
      <CardHeader>
        <CardTitle className="text-sm">Game Rules</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1">
        <p>• Faster submissions earn bonus points</p>
        <p>• First to reach 1000 points wins</p>
        <p>• Game ends after 2 minutes - highest score wins</p>
        <p>• No repeated words allowed</p>
        {gameMode === 'wordchain' && (
          <p>• Each word must start with the last letter of the previous word</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GameRules;
