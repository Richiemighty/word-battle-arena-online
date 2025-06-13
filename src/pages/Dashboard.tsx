
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Users, 
  MessageCircle, 
  Gamepad2, 
  LogOut, 
  Crown,
  Target,
  Coins,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_credits: number;
  rank: string;
  is_online: boolean;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive",
        });
      } else {
        setProfile(profileData);
        // Update online status
        await supabase.rpc("update_user_online_status", {
          user_id: user.id,
          is_online: true
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (profile) {
        await supabase.rpc("update_user_online_status", {
          user_id: profile.id,
          is_online: false
        });
      }
      
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const startPracticeGame = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Profile not found</h1>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-battle rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome, {profile.display_name || profile.username}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{profile.rank}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{profile.total_wins}</div>
              <p className="text-sm text-muted-foreground">Wins</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{profile.total_losses}</div>
              <p className="text-sm text-muted-foreground">Losses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-yellow-500/40">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{profile.total_draws}</div>
              <p className="text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-blue-500/40">
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{profile.total_credits}</div>
              <p className="text-sm text-muted-foreground">Credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="play">Play</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Practice Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Sharpen your skills against the computer. Perfect for warming up!
                  </p>
                  <Button onClick={startPracticeGame} className="w-full bg-gradient-battle hover:opacity-90">
                    Start Practice Game
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Multiplayer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Challenge your friends or find random opponents online!
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle>Friends & Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Friend system coming soon! You'll be able to add friends, send game requests, and see who's online.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Leaderboard coming soon! Compete with players worldwide and climb the ranks.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Chat system coming soon! Message your friends and coordinate your battles.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
