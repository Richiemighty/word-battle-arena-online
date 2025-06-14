
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Gamepad2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameInvitation {
  id: string;
  sender_id: string;
  category: string;
  status: string;
  created_at: string;
  game_session_id: string;
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
    
    // Listen for real-time updates
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
          console.log('New game invitation received:', payload);
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
          id,
          sender_id,
          category,
          status,
          created_at,
          game_session_id,
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

  const handleInvitation = async (invitationId: string, action: 'accepted' | 'declined', gameSessionId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("game_invitations")
        .update({ status: action })
        .eq("id", invitationId);

      if (error) throw error;

      if (action === 'accepted' && gameSessionId) {
        // Update game session status
        await supabase
          .from("game_sessions")
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq("id", gameSessionId);

        toast({
          title: "Game invitation accepted!",
          description: "Joining game...",
        });

        // Navigate to game
        navigate(`/game/${gameSessionId}`);
      } else {
        toast({
          title: action === 'accepted' ? "Invitation accepted!" : "Invitation declined",
          description: action === 'accepted' ? "Joining game..." : "Invitation declined",
        });
      }

      fetchInvitations();
    } catch (error) {
      console.error("Error handling invitation:", error);
      toast({
        title: "Error",
        description: "Failed to handle invitation",
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
    <Card className="bg-gradient-card border-primary/40 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Game Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">
                    {invitation.sender.display_name || invitation.sender.username} invited you to play
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{invitation.category}</Badge>
                    <span>• {new Date(invitation.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleInvitation(invitation.id, 'accepted', invitation.game_session_id)}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleInvitation(invitation.id, 'declined')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameNotifications;
