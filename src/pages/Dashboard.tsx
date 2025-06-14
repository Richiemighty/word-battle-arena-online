import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Users, 
  MessageCircle, 
  Gamepad2, 
  LogOut, 
  Crown,
  Target,
  Coins,
  User,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import FriendSearch from "@/components/FriendSearch";
import FriendsList from "@/components/FriendsList";
import Leaderboard from "@/components/Leaderboard";
import Chat from "@/components/Chat";
import GameNotifications from "@/components/GameNotifications";
import PracticeGameRoom from "@/components/PracticeGameRoom";
import ProfileEditor from "@/components/ProfileEditor";
import { useSoundEffects } from "@/hooks/useSoundEffects";

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
  avatar_id: string | null;
  sound_enabled: boolean;
}

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  unlock_level: number;
  credits_required: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [userAvatar, setUserAvatar] = useState<Avatar | null>(null);
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();

  const practiceCategories = [
    { id: "animals", name: "Animals" },
    { id: "fruits", name: "Fruits" },
    { id: "countries", name: "Countries" },
    { id: "colors", name: "Colors" },
    { id: "sports", name: "Sports" },
    { id: "food", name: "Food" }
  ];

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

      // Fetch user profile with avatar
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(`
          *,
          avatars (
            id,
            name,
            emoji,
            unlock_level,
            credits_required
          )
        `)
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
        setUserAvatar(profileData.avatars);
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
      await playSound('click');
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

  const startPracticeGame = async () => {
    await playSound('click');
    setShowCategoryDialog(true);
  };

  const handlePracticeCategory = async (categoryId: string) => {
    await playSound('click');
    const category = practiceCategories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setPracticeMode(true);
      setShowCategoryDialog(false);
    }
  };

  const findRandomMatch = async () => {
    await playSound('click');
    toast({
      title: "Finding Match",
      description: "Looking for online players...",
    });
    // TODO: Implement random matchmaking
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (practiceMode && selectedCategory) {
    return (
      <PracticeGameRoom 
        category={selectedCategory}
        onBack={() => {
          setPracticeMode(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-battle rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowProfileEditor(true)}
            >
              {userAvatar ? (
                <span className="text-2xl sm:text-3xl">{userAvatar.emoji}</span>
              ) : (
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-bold gradient-text">
                Welcome, {profile.display_name || profile.username}!
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Badge variant="secondary" className="text-xs sm:text-sm">{profile.rank}</Badge>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProfileEditor(true)}
              className="text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Game Notifications */}
        <GameNotifications currentUserId={profile.id} />

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-3 sm:p-6 text-center">
              <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_wins}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Wins</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-3 sm:p-6 text-center">
              <Target className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_losses}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Losses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-yellow-500/40">
            <CardContent className="p-3 sm:p-6 text-center">
              <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_draws}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-blue-500/40">
            <CardContent className="p-3 sm:p-6 text-center">
              <Coins className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_credits}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Mobile Responsive Tabs */}
        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6">
            <TabsTrigger value="play" className="text-xs sm:text-sm">Play</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs sm:text-sm">Friends</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">Board</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gradient-card border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Gamepad2 className="h-4 sm:h-5 w-4 sm:w-5" />
                    Practice Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                    Sharpen your skills against the computer. Perfect for warming up!
                  </p>
                  <Button onClick={startPracticeGame} className="w-full bg-gradient-battle hover:opacity-90 text-sm">
                    Start Practice Game
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                    Multiplayer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                    Challenge your friends or find random opponents online!
                  </p>
                  <Button onClick={findRandomMatch} className="w-full bg-gradient-battle hover:opacity-90 text-sm">
                    Find Random Match
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6 space-y-4 sm:space-y-6">
            <FriendSearch currentUserId={profile.id} />
            <FriendsList currentUserId={profile.id} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Chat currentUserId={profile.id} />
          </TabsContent>
        </Tabs>

        {/* Profile Editor Dialog */}
        {profile && (
          <ProfileEditor
            isOpen={showProfileEditor}
            onClose={() => setShowProfileEditor(false)}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {/* Practice Category Selection Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">Choose Practice Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={handlePracticeCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select a category to practice" />
                </SelectTrigger>
                <SelectContent>
                  {practiceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-sm">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowCategoryDialog(false)}
                className="w-full text-sm"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
