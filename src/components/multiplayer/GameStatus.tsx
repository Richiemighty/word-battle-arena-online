
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface GameStatusProps {
  currentPlayerName: string;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  gameStatus: string;
  isMyTurn: boolean;
  gameTimeLeft: number;
  countdownTime: number;
}

const GameStatus = ({ 
  currentPlayerName, 
  opponentName, 
  myScore, 
  opponentScore, 
  gameStatus, 
  isMyTurn, 
  gameTimeLeft,
  countdownTime 
}: GameStatusProps) => {
  return (
    <Card className="bg-gradient-card mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-lg font-bold">{currentPlayerName}</div>
            <div className="text-2xl font-bold text-blue-500">{myScore}</div>
          </div>
          <div className="text-center">
            <div className="space-y-2">
              <Badge variant={gameStatus === 'active' ? 'default' : 'secondary'}>
                {gameStatus === 'waiting' ? 'Waiting for opponent' : 
                 gameStatus === 'countdown' ? 'Starting...' :
                 gameStatus === 'active' ? 'Game Active' : 'Game Over'}
              </Badge>
              {gameStatus === 'active' && countdownTime === 0 && (
                <>
                  <div>
                    <Badge variant={isMyTurn ? 'default' : 'outline'}>
                      {isMyTurn ? 'Your Turn' : `${opponentName}'s Turn`}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Game Time: {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{opponentName}</div>
            <div className="text-2xl font-bold text-red-500">{opponentScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStatus;
