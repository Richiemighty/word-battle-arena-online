
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sword, 
  Users, 
  Trophy, 
  Zap, 
  User, 
  Play, 
  GamepadIcon,
  Target,
  Clock,
  Star,
  ChevronRight,
  Shield,
  Crown,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onStartGame: () => void;
}

const LandingPage = ({ onStartGame }: LandingPageProps) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sword className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />,
      title: "Battle Arena",
      description: "Face off in real-time word battles",
      color: "border-primary/20 hover:border-primary/40"
    },
    {
      icon: <Users className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />,
      title: "Multiplayer",
      description: "Challenge friends or find opponents",
      color: "border-accent/20 hover:border-accent/40"
    },
    {
      icon: <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-destructive" />,
      title: "Fast Paced",
      description: "30-second rounds, lightning quick",
      color: "border-destructive/20 hover:border-destructive/40"
    },
    {
      icon: <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500" />,
      title: "Leaderboards",
      description: "Climb the ranks and earn glory",
      color: "border-yellow-500/20 hover:border-yellow-500/40"
    }
  ];

  const gameRules = [
    "Think of words related to the chosen category",
    "Type your word within the time limit",
    "Earn points for valid, unique words",
    "Longer words earn more points",
    "First to reach the score limit wins!"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
        <Button 
          onClick={() => navigate("/auth")}
          variant="outline"
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Sign In / Sign Up</span>
          <span className="sm:hidden">Sign In</span>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-primary animate-pulse" />
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold gradient-text battle-pulse">
                WORD BATTLE
              </h1>
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-accent animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-accent">
              ZONES
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Challenge your friends in the ultimate word battle! Think fast, type faster, and dominate the arena.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 animate-scale-in">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={onStartGame}
                size="lg" 
                className="text-base sm:text-xl px-6 sm:px-8 py-3 sm:py-4 bg-gradient-battle hover:opacity-90 battle-glow transition-all duration-300 hover-scale"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                PRACTICE MODE
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                size="lg" 
                variant="outline"
                className="text-base sm:text-xl px-6 sm:px-8 py-3 sm:py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover-scale"
              >
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                JOIN THE BATTLE
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Practice mode available now • Create account for multiplayer battles
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
              Game Features
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Experience the thrill of competitive word battles with these exciting features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`bg-gradient-card ${feature.color} transition-all duration-300 hover:scale-105 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mb-3 sm:mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
              How to Play
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Master the arena with these simple rules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-4 sm:space-y-6">
              {gameRules.map((rule, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-battle rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm sm:text-base text-foreground">{rule}</p>
                </div>
              ))}
            </div>

            <div className="relative">
              <Card className="bg-gradient-card border-primary/40 p-4 sm:p-6 animate-scale-in">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GamepadIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm font-semibold">Game Session</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      30s
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Category: Animals</span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Target: 1000pts
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Player 1: 750pts</span>
                      <span>Player 2: 650pts</span>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-center text-muted-foreground">
                      Type your word here...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
              Battle Categories
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Choose your battlefield from various exciting categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: "Animals", emoji: "🦁", color: "border-green-500/40" },
              { name: "Countries", emoji: "🌍", color: "border-blue-500/40" },
              { name: "Food", emoji: "🍕", color: "border-yellow-500/40" },
              { name: "Sports", emoji: "⚽", color: "border-orange-500/40" },
              { name: "Colors", emoji: "🎨", color: "border-purple-500/40" },
              { name: "Fruits", emoji: "🍎", color: "border-red-500/40" }
            ].map((category, index) => (
              <Card 
                key={index}
                className={`bg-gradient-card ${category.color} hover:scale-105 transition-all duration-300 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-2">{category.emoji}</div>
                  <p className="text-xs sm:text-sm font-semibold">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-6 sm:mb-8">
            Ready to Battle?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <Card className="bg-gradient-card border-primary/40 hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2">Practice Mode</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Sharpen your skills against the computer
                </p>
                <Button 
                  onClick={onStartGame}
                  className="w-full bg-gradient-battle hover:opacity-90 text-sm"
                >
                  Start Training
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/40 hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <Star className="h-8 w-8 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2">Multiplayer</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Challenge friends and climb leaderboards
                </p>
                <Button 
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm"
                >
                  Create Account
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Join thousands of players in the ultimate word battle experience!
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
