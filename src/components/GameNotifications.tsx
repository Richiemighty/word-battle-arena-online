import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface GameInvitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  game_session_id: string;
  category: string;
  status: string | null;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
  };
}

interface GameNotificationsProps {
  currentUserId: string;
}

const GameNotifications = ({ currentUserId }: GameNotificationsProps) => {
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();

    // Set up a real-time subscription to listen for new game invitations
    const channel = supabase
      .channel('game_invitations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_invitations' },
        (payload) => {
          if (payload.new && payload.new.receiver_id === currentUserId) {
            // Fetch the updated list of invitations
            fetchInvitations();
            playSound('notification');
            toast({
              title: "New Game Invitation!",
              description: `You have a new game invitation.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_invitations")
        .select(`
          *,
          sender:sender_id (
            username,
            display_name
          )
        `)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching game invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load game invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitation: GameInvitation) => {
    try {
      await playSound('click');
      // Accept the invitation
      const { error: acceptError } = await supabase
        .from("game_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (acceptError) throw acceptError;

      // Update game session status
      const { error: gameError } = await supabase
        .from("game_sessions")
        .update({ 
          status: "active",
          started_at: new Date().toISOString()
        })
        .eq("id", invitation.game_session_id);

      if (gameError) throw gameError;

      await playSound('notification');
      toast({
        title: "Invitation Accepted!",
        description: "Joining the game room...",
      });

      // Navigate to game room
      navigate(`/game/${invitation.game_session_id}`);
      
      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      await playSound('click');
      const { error } = await supabase
        .from("game_invitations")
        .update({ status: "rejected" })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Rejected",
        description: "You declined the game invitation",
      });

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  if (!invitations.length) {
    return <div className="text-sm text-muted-foreground mb-6">No pending game invitations.</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 mb-6">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="bg-gradient-card border-accent/40 animate-fade-in">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                  <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                    Game Invitation from {invitation.sender?.display_name || invitation.sender?.username}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Category: {invitation.category} • {formatDistanceToNow(new Date(invitation.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={() => acceptInvitation(invitation)}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectInvitation(invitation.id)}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GameNotifications;
