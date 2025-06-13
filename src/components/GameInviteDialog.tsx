
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gamepad2 } from "lucide-react";
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
  "Technology",
  "Nature",
  "History"
];

const GameInviteDialog = ({ friendId, currentUserId, isOpen, onClose }: GameInviteDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendGameInvitation = async () => {
    if (!selectedCategory) {
      toast({
        title: "Select a category",
        description: "Please choose a game category before sending invitation",
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
          category: selectedCategory,
          status: "waiting",
          current_turn: currentUserId
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // For now, directly navigate both players to the game
      // In a real implementation, you'd send a notification to the friend
      toast({
        title: "Game invitation sent!",
        description: `Your friend has been invited to play ${selectedCategory}`,
      });

      // Navigate to the game
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Send Game Invitation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose Game Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={sendGameInvitation}
              disabled={loading || !selectedCategory}
              className="bg-gradient-battle hover:opacity-90"
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
