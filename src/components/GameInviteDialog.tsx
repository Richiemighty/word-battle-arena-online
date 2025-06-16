
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gamepad2, Target, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameInviteDialogProps {
  friendId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Animals",
  "Countries", 
  "Food",
  "Movies",
  "Sports",
  "Colors",
  "Fruits"
];

const GameInviteDialog = ({ friendId, currentUserId, isOpen, onClose }: GameInviteDialogProps) => {
  const [selectedGameMode, setSelectedGameMode] = useState<"category" | "wordchain" | "">("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendGameInvitation = async () => {
    if (!selectedGameMode) {
      toast({
        title: "Select a game mode",
        description: "Please choose a game mode before sending invitation",
        variant: "destructive",
      });
      return;
    }

    if (selectedGameMode === "category" && !selectedCategory) {
      toast({
        title: "Select a category",
        description: "Please choose a category for the category naming game",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new game session
      const { data: gameData, error: gameError } = await supabase
        .from("game_sessions")
        .insert({
          player1_id: currentUserId,
          player2_id: friendId,
          category: selectedGameMode === "category" ? selectedCategory : "WordChain",
          game_mode: selectedGameMode,
          status: "waiting",
          current_turn: friendId, // Receiver gets first turn advantage
          time_limit: 120,
          turn_time_limit: 30,
          max_credits: 1000
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create game invitation
      const { error: inviteError } = await supabase
        .from("game_invitations")
        .insert({
          sender_id: currentUserId,
          receiver_id: friendId,
          game_session_id: gameData.id,
          category: selectedGameMode === "category" ? selectedCategory : "WordChain",
          game_mode: selectedGameMode,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      const gameTypeText = selectedGameMode === "category" 
        ? `${selectedCategory} Category Naming` 
        : "Word Chain";

      toast({
        title: "Game invitation sent!",
        description: `Your friend has been invited to play ${gameTypeText}`,
      });

      // Navigate to game room (waiting)
      navigate(`/game/${gameData.id}`);
      onClose();
    } catch (error) {
      console.error("Error sending game invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send game invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedGameMode("");
    setSelectedCategory("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Send Game Invitation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose Game Mode
            </label>
            <Select value={selectedGameMode} onValueChange={(value: "category" | "wordchain") => {
              setSelectedGameMode(value);
              setSelectedCategory(""); // Reset category when mode changes
            }}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category" className="text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Category Naming
                  </div>
                </SelectItem>
                <SelectItem value="wordchain" className="text-sm">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Word Chain
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedGameMode === "category" && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Choose Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-sm">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              resetForm();
              onClose();
            }} className="text-sm">
              Cancel
            </Button>
            <Button 
              onClick={sendGameInvitation}
              disabled={loading || !selectedGameMode || (selectedGameMode === "category" && !selectedCategory)}
              className="bg-gradient-battle hover:opacity-90 text-sm"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameInviteDialog;
