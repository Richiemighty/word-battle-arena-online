
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sword, Users, Trophy, Zap, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onStartGame: () => void;
}

const LandingPage = ({ onStartGame }: LandingPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header with Auth Button */}
        <div className="absolute top-6 right-6">
          <Button 
            onClick={() => navigate("/auth")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Sign In / Sign Up
          </Button>
        </div>

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

        {/* CTA Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onStartGame}
              size="lg" 
              className="text-xl px-8 py-4 bg-gradient-battle hover:opacity-90 battle-glow transition-all duration-300"
            >
              PRACTICE MODE
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              size="lg" 
              variant="outline"
              className="text-xl px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              JOIN THE BATTLE
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Practice mode available now • Create account for multiplayer battles
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
