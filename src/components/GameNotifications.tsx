
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, CheckCircle, XCircle, Target, Link } from "lucide-react";
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
  game_mode?: string;
  status: string | null;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
  };
  game_session?: {
    status: string;
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
          console.log('Game invitation change:', payload);
          if (payload.new && typeof payload.new === 'object' && 'receiver_id' in payload.new && payload.new.receiver_id === currentUserId) {
            fetchInvitations();
            if (payload.eventType === 'INSERT') {
              playSound('notification');
              toast({
                title: "New Game Invitation!",
                description: `You have a new game invitation.`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        (payload) => {
          console.log('Game session change:', payload);
          // Refresh invitations when game sessions change
          fetchInvitations();
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
      console.log('Fetching invitations for user:', currentUserId);
      
      const { data, error } = await supabase
        .from("game_invitations")
        .select(`
          *,
          sender:profiles!game_invitations_sender_id_fkey (
            username,
            display_name
          ),
          game_session:game_sessions!game_invitations_game_session_id_fkey (
            status
          )
        `)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Fetched invitations:', data);

      // Filter out invitations where game session is cancelled, completed, or null
      const activeInvitations = (data || []).filter(invitation => {
        const gameStatus = invitation.game_session?.status;
        return gameStatus === 'waiting' || gameStatus === 'active';
      });

      // Find cancelled/completed invitations to clean up
      const inactiveInvitations = (data || []).filter(invitation => {
        const gameStatus = invitation.game_session?.status;
        return !gameStatus || gameStatus === 'cancelled' || gameStatus === 'completed';
      });

      console.log('Active invitations:', activeInvitations);
      console.log('Inactive invitations:', inactiveInvitations);

      // Clean up inactive invitations automatically
      if (inactiveInvitations.length > 0) {
        console.log('Cleaning up inactive invitations');
        const { error: cleanupError } = await supabase
          .from("game_invitations")
          .update({ status: "cancelled" })
          .in("id", inactiveInvitations.map(inv => inv.id));

        if (cleanupError) {
          console.error('Error cleaning up invitations:', cleanupError);
        }
      }

      setInvitations(activeInvitations);
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

      console.log('Accepting invitation:', invitation);

      // Check if game session is still active
      const { data: gameSession, error: gameCheckError } = await supabase
        .from("game_sessions")
        .select("status")
        .eq("id", invitation.game_session_id)
        .single();

      console.log('Game session status:', gameSession);

      if (gameCheckError) {
        console.error('Error checking game status:', gameCheckError);
        toast({
          title: "Invitation Expired",
          description: "This game invitation is no longer active",
          variant: "destructive",
        });
        fetchInvitations(); // Refresh to remove expired invitations
        return;
      }

      if (gameSession?.status !== 'waiting') {
        toast({
          title: "Invitation Expired",
          description: "This game invitation is no longer active",
          variant: "destructive",
        });
        fetchInvitations(); // Refresh to remove expired invitations
        return;
      }

      // Accept the invitation
      const { error: acceptError } = await supabase
        .from("game_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (acceptError) {
        console.error('Error accepting invitation:', acceptError);
        throw acceptError;
      }

      // Update game session status
      const { error: gameError } = await supabase
        .from("game_sessions")
        .update({ 
          status: "active",
          started_at: new Date().toISOString(),
          turn_time_limit: 30
        })
        .eq("id", invitation.game_session_id);

      if (gameError) {
        console.error('Error updating game session:', gameError);
        throw gameError;
      }

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

  const rejectInvitation = async (invitationId: string, gameSessionId: string) => {
    try {
      await playSound('click');
      
      // Update invitation status
      const { error: inviteError } = await supabase
        .from("game_invitations")
        .update({ status: "rejected" })
        .eq("id", invitationId);

      if (inviteError) throw inviteError;

      // Cancel the game session
      const { error: gameError } = await supabase
        .from("game_sessions")
        .update({ status: "cancelled" })
        .eq("id", gameSessionId);

      if (gameError) throw gameError;

      toast({
        title: "Invitation Rejected",
        description: "You declined the game invitation",
      });

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to reject invitation",
        variant: "destructive",
      });
    }
  };

  const getGameModeIcon = (gameMode?: string) => {
    return gameMode === "wordchain" ? Link : Target;
  };

  const getGameModeText = (invitation: GameInvitation) => {
    if (invitation.game_mode === "wordchain") {
      return "Word Chain";
    }
    return `${invitation.category} Category`;
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground mb-6">Loading invitations...</div>;
  }

  if (!invitations.length) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 mb-6">
      {invitations.map((invitation) => {
        const GameModeIcon = getGameModeIcon(invitation.game_mode);
        
        return (
          <Card key={invitation.id} className="bg-gradient-card border-accent/40 animate-fade-in">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                    <GameModeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                      Game Invitation from {invitation.sender?.display_name || invitation.sender?.username}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {getGameModeText(invitation)} • {formatDistanceToNow(new Date(invitation.created_at))} ago
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
                    onClick={() => rejectInvitation(invitation.id, invitation.game_session_id)}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GameNotifications;
