
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  LogOut, 
  Crown,
  Target,
  Coins,
  User,
  Settings,
  Link
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
  wordchain_wins: number;
  wordchain_losses: number;
  wordchain_draws: number;
  wordchain_credits: number;
  wordchain_rank: string;
  category_wins: number;
  category_losses: number;
  category_draws: number;
  category_credits: number;
  category_rank: string;
}

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  unlock_level: number;
  credits_required: number;
}

interface StatisticsProps {
  profile: Profile;
  userAvatar: Avatar | null;
  onProfileUpdate: (profile: Profile) => void;
}

const Statistics = ({ profile, userAvatar, onProfileUpdate }: StatisticsProps) => {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();

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

  const userLevel = getUserLevel(profile.total_credits);

  return (
    <div className="p-4 pb-20">
      {/* Header */}
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
              {profile.display_name || profile.username}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Card className="bg-gradient-card border-green-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_wins}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Wins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-red-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Target className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_losses}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Losses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-yellow-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_draws}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Draws</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-blue-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Coins className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.total_credits}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-purple-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Link className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.wordchain_wins || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Chain Wins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-orange-500/40">
          <CardContent className="p-3 sm:p-6 text-center">
            <Target className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{profile.category_wins || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Category Wins</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Mode Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-card border-purple-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link className="h-4 w-4" />
              Word Chain Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rank:</span>
              <Badge variant="secondary">{profile.wordchain_rank || 'Chain Beginner'}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Credits:</span>
              <span className="font-bold">{profile.wordchain_credits || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>W/L/D:</span>
              <span>{profile.wordchain_wins || 0}/{profile.wordchain_losses || 0}/{profile.wordchain_draws || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-orange-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rank:</span>
              <Badge variant="secondary">{profile.category_rank || 'Topic Beginner'}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Credits:</span>
              <span className="font-bold">{profile.category_credits || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>W/L/D:</span>
              <span>{profile.category_wins || 0}/{profile.category_losses || 0}/{profile.category_draws || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Editor Dialog */}
      {profile && (
        <ProfileEditor
          isOpen={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          profile={profile}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </div>
  );
};

export default Statistics;
