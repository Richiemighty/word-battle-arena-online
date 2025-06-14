
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameInvitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  game_session_id: string;
  category: string;
  status: string;
  created_at: string;
  expires_at: string;
  sender: {
    id: string;
    username: string;
    display_name: string;
  };
}

interface GameNotificationsProps {
  currentUserId: string;
}

const GameNotifications = ({ currentUserId }: GameNotificationsProps) => {
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();

    // Listen for real-time invitation updates
    const channel = supabase
      .channel('game-invitations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invitations',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('New invitation received:', payload);
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("game_invitations")
        .select(`
          *,
          sender:profiles!game_invitations_sender_id_fkey(id, username, display_name)
        `)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const handleInvitationResponse = async (invitationId: string, gameSessionId: string, response: 'accepted' | 'declined') => {
    setLoading(true);
    try {
      // Update invitation status
      const { error: inviteError } = await supabase
        .from("game_invitations")
        .update({ status: response })
        .eq("id", invitationId);

      if (inviteError) throw inviteError;

      if (response === 'accepted') {
        // Update game session to active
        const { error: gameError } = await supabase
          .from("game_sessions")
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq("id", gameSessionId);

        if (gameError) throw gameError;

        toast({
          title: "Game invitation accepted!",
          description: "Joining the game room...",
        });

        // Navigate to game room
        navigate(`/game/${gameSessionId}`);
      } else {
        // Update game session to cancelled
        await supabase
          .from("game_sessions")
          .update({ status: 'cancelled' })
          .eq("id", gameSessionId);

        toast({
          title: "Game invitation declined",
          description: "The invitation has been declined",
        });
      }

      // Refresh invitations
      fetchInvitations();
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-sm sm:text-lg font-semibold">Game Invitations</h2>
        <Badge variant="secondary" className="text-xs">
          {invitations.length}
        </Badge>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="bg-gradient-card border-primary/40">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {invitation.sender.display_name || invitation.sender.username}
                  </span>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    invited you to play
                  </span>
                </div>
                <Badge variant="outline" className="text-xs w-fit">
                  {invitation.category}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>
                    Expires in {Math.max(0, Math.floor((new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60)))} minutes
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInvitationResponse(invitation.id, invitation.game_session_id, 'declined')}
                    disabled={loading}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleInvitationResponse(invitation.id, invitation.game_session_id, 'accepted')}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gradient-battle hover:opacity-90 text-xs sm:text-sm"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameNotifications;
