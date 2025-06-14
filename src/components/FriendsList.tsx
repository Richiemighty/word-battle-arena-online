
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
                      <Card key={friendship.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base truncate">{friend.display_name || friend.username}</p>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                  <Badge variant="secondary" className="text-xs">{friend.rank}</Badge>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className="text-xs">{friend.is_online ? 'Online' : 'Offline'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!friend.is_online}
                                onClick={() => setSelectedFriend(friend.id)}
                                className="w-full sm:w-auto text-xs"
                              >
                                <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Invite to Game
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full sm:w-auto text-xs"
                              >
                                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                      <Card key={friendship.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-battle rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base truncate">{requester.display_name || requester.username}</p>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                  <Badge variant="secondary" className="text-xs">{requester.rank}</Badge>
                                  <span className="text-xs">wants to be your friend</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                onClick={() => handleFriendRequest(friendship.id, 'accepted')}
                                className="bg-green-500 hover:bg-green-600 w-full sm:w-auto text-xs"
                              >
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleFriendRequest(friendship.id, 'declined')}
                                className="w-full sm:w-auto text-xs"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
