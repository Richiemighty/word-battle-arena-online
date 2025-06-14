
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Volume2, VolumeX, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  unlock_level: number;
  credits_required: number;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  total_credits: number;
  avatar_id: string | null;
  sound_enabled: boolean;
}

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const ProfileEditor = ({ isOpen, onClose, profile, onProfileUpdate }: ProfileEditorProps) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(profile.avatar_id);
  const [soundEnabled, setSoundEnabled] = useState(profile.sound_enabled);
  const [loading, setLoading] = useState(false);
  const [userUnlockLevel, setUserUnlockLevel] = useState(0);

  useEffect(() => {
    fetchAvatars();
    getUserUnlockLevel();
  }, [profile.total_credits]);

  const fetchAvatars = async () => {
    try {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .order('unlock_level', { ascending: true });

      if (error) throw error;
      setAvatars(data || []);
    } catch (error) {
      console.error('Error fetching avatars:', error);
    }
  };

  const getUserUnlockLevel = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_unlock_level', { user_credits: profile.total_credits });

      if (error) throw error;
      setUserUnlockLevel(data);
    } catch (error) {
      console.error('Error getting unlock level:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_id: selectedAvatarId,
          sound_enabled: soundEnabled
        })
        .eq('id', profile.id);

      if (error) throw error;

      const updatedProfile = {
        ...profile,
        avatar_id: selectedAvatarId,
        sound_enabled: soundEnabled
      };

      onProfileUpdate(updatedProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAvatarUnlocked = (avatar: Avatar) => {
    return userUnlockLevel >= avatar.unlock_level;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Profile Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-card rounded-lg border">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-battle rounded-full flex items-center justify-center text-2xl sm:text-3xl">
              {avatars.find(a => a.id === profile.avatar_id)?.emoji || <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{profile.display_name || profile.username}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {profile.total_credits} Credits • Level {userUnlockLevel}
              </p>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold">Sound Settings</h4>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <Label htmlFor="sound-toggle" className="flex items-center gap-2 text-xs sm:text-sm">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Game Sound Effects
              </Label>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold">Choose Avatar</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
              {avatars.map((avatar) => {
                const isUnlocked = isAvatarUnlocked(avatar);
                const isSelected = selectedAvatarId === avatar.id;
                
                return (
                  <Card 
                    key={avatar.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${!isUnlocked ? 'opacity-50' : 'hover:scale-105'}`}
                    onClick={() => isUnlocked && setSelectedAvatarId(avatar.id)}
                  >
                    <CardContent className="p-2 sm:p-3 text-center relative">
                      <div className="text-2xl sm:text-3xl mb-1">{avatar.emoji}</div>
                      <p className="text-xs font-medium truncate">{avatar.name}</p>
                      {avatar.unlock_level > 0 && (
                        <Badge 
                          variant={isUnlocked ? "secondary" : "outline"}
                          className="text-xs mt-1"
                        >
                          Lv{avatar.unlock_level}
                        </Badge>
                      )}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Unlock more avatars by earning credits! Next unlock at {
                avatars.find(a => a.unlock_level > userUnlockLevel)?.credits_required || 'Max'
              } credits.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancel
            </Button>
            <Button 
              onClick={saveProfile}
              disabled={loading}
              className="bg-gradient-battle hover:opacity-90 text-sm"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
