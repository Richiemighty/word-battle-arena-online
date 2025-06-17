
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordsUsedProps {
  wordsUsed: string[];
}

const WordsUsed = ({ wordsUsed }: WordsUsedProps) => {
  if (!wordsUsed || wordsUsed.length === 0) return null;

  return (
    <Card className="bg-gradient-card mb-6">
      <CardHeader>
        <CardTitle className="text-sm">Words Used ({wordsUsed.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {wordsUsed.map((word, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {word}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordsUsed;
