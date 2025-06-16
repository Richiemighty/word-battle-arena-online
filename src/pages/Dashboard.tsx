import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import GameModeSelection, { GameMode } from "@/components/GameModeSelection";
import PracticeGameRoom from "@/components/PracticeGameRoom";
import WordChainGameRoom from "@/components/WordChainGameRoom";
import ProfileEditor from "@/components/ProfileEditor";
import CategorySelection from "@/components/CategorySelection";
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
  const [gameState, setGameState] = useState<'dashboard' | 'mode-selection' | 'category-selection' | 'practice' | 'wordchain'>('dashboard');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
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

  // Calculate user level based on credits
  const getUserLevel = (credits: number): number => {
    if (credits >= 7500) return 8;
    if (credits >= 6500) return 7;
    if (credits >= 5500) return 6;
    if (credits >= 4500) return 5;
    if (credits >= 3500) return 4;
    if (credits >= 2500) return 3;
    if (credits >= 1500) return 2;
    if (credits >= 750) return 1;
    return 0;
  };

  // Calculate user rank based on credits
  const getUserRank = (credits: number): string => {
    if (credits >= 5000) return 'Master';
    if (credits >= 2000) return 'Expert';
    if (credits >= 1000) return 'Advanced';
    if (credits >= 500) return 'Intermediate';
    return 'Beginner';
  };

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
        // Update profile with correct rank based on credits
        const correctRank = getUserRank(profileData.total_credits);
        if (profileData.rank !== correctRank) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ rank: correctRank })
            .eq("id", user.id);
          
          if (!updateError) {
            profileData.rank = correctRank;
          }
        }

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
    setGameState('mode-selection');
  };

  const handleGameModeSelect = async (mode: GameMode) => {
    await playSound('click');
    setSelectedGameMode(mode);
    
    if (mode === 'wordchain') {
      setGameState('wordchain');
    } else {
      // For category mode, show category selection
      setGameState('category-selection');
    }
  };

  const handleCategorySelect = async (category: {id: string, name: string}) => {
    await playSound('click');
    setSelectedCategory(category);
    setGameState('practice');
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

  const handleBackToDashboard = () => {
    setGameState('dashboard');
    setSelectedGameMode(null);
    setSelectedCategory(null);
  };

  const handleBackToModeSelection = () => {
    setGameState('mode-selection');
    setSelectedCategory(null);
  };

  if (gameState === 'mode-selection') {
    return (
      <GameModeSelection 
        onSelectMode={handleGameModeSelect}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (gameState === 'category-selection') {
    return (
      <CategorySelection
        categories={practiceCategories}
        onSelectCategory={handleCategorySelect}
        onBack={handleBackToModeSelection}
        title="Choose Category for Practice"
      />
    );
  }

  if (gameState === 'practice' && selectedCategory) {
    return (
      <PracticeGameRoom 
        category={selectedCategory}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (gameState === 'wordchain') {
    return (
      <WordChainGameRoom 
        onBack={handleBackToDashboard}
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

  const userLevel = getUserLevel(profile.total_credits);

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
                <Badge variant="outline" className="text-xs sm:text-sm">Level {userLevel}</Badge>
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
                    Choose between Category Naming and Word Chain modes. Perfect for warming up!
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
      </div>
    </div>
  );
};

export default Dashboard;
