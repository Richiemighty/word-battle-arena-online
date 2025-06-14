
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  rank: string;
  is_online: boolean;
  total_wins: number;
}

interface FriendSearchProps {
  currentUserId: string;
}

const FriendSearch = ({ currentUserId }: FriendSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, rank, is_online, total_wins")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          requester_id: currentUserId,
          addressee_id: targetUserId,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== targetUserId));
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      if (error.code === "23505") {
        toast({
          title: "Already sent",
          description: "You've already sent a friend request to this user.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send friend request",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by username or display name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers()}
            className="bg-input border-border focus:border-primary"
          />
          <Button onClick={searchUsers} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <Card key={user.id} className="border-border">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-battle rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{user.display_name || user.username}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                          <Badge variant="secondary" className="text-xs">{user.rank}</Badge>
                          <span className="text-xs">{user.total_wins} wins</span>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-xs">{user.is_online ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user.id)}
                      className="bg-gradient-battle hover:opacity-90 w-full sm:w-auto text-xs"
                    >
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Add Friend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !loading && (
          <p className="text-center text-muted-foreground py-4">
            No users found matching your search.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendSearch;
