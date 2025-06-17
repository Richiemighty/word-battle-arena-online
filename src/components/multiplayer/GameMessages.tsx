
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameMessagesProps {
  messages: string[];
}

const GameMessages = ({ messages }: GameMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <Card className="bg-gradient-card mb-6">
      <CardHeader>
        <CardTitle className="text-sm">Game Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {messages.map((message, index) => (
            <p key={index} className="text-xs text-muted-foreground">{message}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameMessages;
