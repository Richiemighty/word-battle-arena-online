
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import GameNotifications from "@/components/GameNotifications";
import BottomNavigation from "@/components/BottomNavigation";
import Statistics from "./Statistics";
import Practice from "./Practice";
import Friends from "./Friends";
import Board from "./Board";
import ChatPage from "./Chat";

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

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [userAvatar, setUserAvatar] = useState<Avatar | null>(null);
  const navigate = useNavigate();

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

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
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
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Statistics 
            profile={profile} 
            userAvatar={userAvatar} 
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case 'practice':
        return <Practice />;
      case 'friends':
        return <Friends currentUserId={profile.id} />;
      case 'board':
        return <Board />;
      case 'chat':
        return <ChatPage currentUserId={profile.id} />;
      default:
        return (
          <Statistics 
            profile={profile} 
            userAvatar={userAvatar} 
            onProfileUpdate={handleProfileUpdate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Game Notifications */}
      <GameNotifications currentUserId={profile.id} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {renderActiveTab()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
