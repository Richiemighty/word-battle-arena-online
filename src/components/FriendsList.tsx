
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Check, 
  X, 
  Gamepad2, 
  MessageCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import GameInviteDialog from "./GameInviteDialog";

interface Friendship {
  id: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    username: string;
    display_name: string;
    rank: string;
    is_online: boolean;
  };
  addressee: {
    id: string;
    username: string;
    display_name: string;
    rank: string;
    is_online: boolean;
  };
}

interface FriendsListProps {
  currentUserId: string;
}

const FriendsList = ({ currentUserId }: FriendsListProps) => {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  useEffect(() => {
    fetchFriendships();
  }, [currentUserId]);

  const fetchFriendships = async () => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, rank, is_online),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, rank, is_online)
        `)
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFriendships(data || []);
    } catch (error) {
      console.error("Error fetching friendships:", error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (friendshipId: string, action: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: action })
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "Friend request accepted!" : "Friend request declined",
        description: action === 'accepted' ? "You are now friends!" : "Request declined",
      });

      fetchFriendships();
    } catch (error) {
      console.error("Error updating friendship:", error);
      toast({
        title: "Error",
        description: "Failed to update friend request",
        variant: "destructive",
      });
    }
  };

  const getFriendData = (friendship: Friendship) => {
    return friendship.requester.id === currentUserId 
      ? friendship.addressee 
      : friendship.requester;
  };

  const pendingRequests = friendships.filter(f => 
    f.status === 'pending' && f.addressee.id === currentUserId
  );

  const activeFriends = friendships.filter(f => f.status === 'accepted');

  if (loading) {
    return <div className="text-center py-8">Loading friends...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            Friends ({activeFriends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeFriends.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No friends yet. Search for users to add them as friends!
                </p>
              ) : (
                <div className="space-y-3">
                  {activeFriends.map((friendship) => {
                    const friend = getFriendData(friendship);
                    return (
                      <div
                        key={friendship.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{friend.display_name || friend.username}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{friend.rank}</Badge>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {friend.is_online ? 'Online' : 'Offline'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!friend.is_online}
                            onClick={() => setSelectedFriend(friend.id)}
                          >
                            <Gamepad2 className="h-4 w-4 mr-1" />
                            Invite to Game
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Friend Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending friend requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((friendship) => {
                    const requester = friendship.requester;
                    return (
                      <div
                        key={friendship.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{requester.display_name || requester.username}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{requester.rank}</Badge>
                              <span>wants to be your friend</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleFriendRequest(friendship.id, 'accepted')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleFriendRequest(friendship.id, 'declined')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedFriend && (
        <GameInviteDialog
          friendId={selectedFriend}
          currentUserId={currentUserId}
          isOpen={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </div>
  );
};

export default FriendsList;
