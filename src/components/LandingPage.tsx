
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sword, Users, Trophy, Zap } from "lucide-react";

interface LandingPageProps {
  onStartGame: () => void;
}

const LandingPage = ({ onStartGame }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold gradient-text battle-pulse">
            WORD BATTLE
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-accent">
            ZONES
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Challenge your friends in the ultimate word battle! Think fast, type faster, and dominate the arena.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
          <Card className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Sword className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Battle Arena</h3>
              <p className="text-sm text-muted-foreground">
                Face off in real-time word battles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Multiplayer</h3>
              <p className="text-sm text-muted-foreground">
                Challenge friends or find opponents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Fast Paced</h3>
              <p className="text-sm text-muted-foreground">
                30-second rounds, lightning quick
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Leaderboards</h3>
              <p className="text-sm text-muted-foreground">
                Climb the ranks and earn glory
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button 
            onClick={onStartGame}
            size="lg" 
            className="text-2xl px-12 py-6 bg-gradient-battle hover:opacity-90 battle-glow transition-all duration-300"
          >
            START BATTLE
          </Button>
          <p className="text-sm text-muted-foreground">
            Practice mode • Full multiplayer coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
