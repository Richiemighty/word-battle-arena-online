
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface GameControlsProps {
  gameMode: string;
  category?: string;
  lastWord: string;
  isMyTurn: boolean;
  userInput: string;
  setUserInput: (value: string) => void;
  onSubmitWord: () => void;
  submitting: boolean;
  timeLeft: number;
  opponentName: string;
}

const GameControls = ({
  gameMode,
  category,
  lastWord,
  isMyTurn,
  userInput,
  setUserInput,
  onSubmitWord,
  submitting,
  timeLeft,
  opponentName
}: GameControlsProps) => {
  return (
    <Card className="bg-gradient-card mb-6">
      <CardHeader>
        <CardTitle className="text-center">
          {gameMode === 'wordchain' && lastWord && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Last word:</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">{lastWord.toUpperCase()}</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Your word must start with "{lastWord[lastWord.length - 1].toUpperCase()}"
              </p>
            </div>
          )}
          {gameMode === 'category' && category && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Category:</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">{category}</Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMyTurn ? (
          <>
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onSubmitWord()}
                placeholder={gameMode === 'wordchain' ? 
                  (lastWord ? `Enter word starting with "${lastWord[lastWord.length - 1].toUpperCase()}"` : "Enter your word") :
                  `Enter a ${category?.toLowerCase()} word`
                }
                className="bg-input"
                disabled={submitting}
                autoFocus
              />
              <Button onClick={onSubmitWord} disabled={!userInput.trim() || submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Turn Time Remaining</span>
                <span>{timeLeft}s</span>
              </div>
              <Progress value={(timeLeft / 30) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Faster submissions earn bonus points!
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Waiting for {opponentName} to play...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameControls;
