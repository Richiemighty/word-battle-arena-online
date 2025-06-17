
import { Card, CardContent } from "@/components/ui/card";

interface GameCountdownProps {
  countdownTime: number;
  isMyTurn: boolean;
  opponentName: string;
}

const GameCountdown = ({ countdownTime, isMyTurn, opponentName }: GameCountdownProps) => {
  if (countdownTime === 0) return null;

  return (
    <Card className="bg-gradient-card mb-6 border-2 border-primary">
      <CardContent className="p-8 text-center">
        <div className="text-6xl font-bold gradient-text mb-4">{countdownTime}</div>
        <p className="text-lg">Game starting soon...</p>
        <p className="text-sm text-muted-foreground mt-2">
          {isMyTurn ? "You have the first turn advantage!" : `${opponentName} goes first!`}
        </p>
      </CardContent>
    </Card>
  );
};

export default GameCountdown;
