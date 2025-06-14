
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_credits: number;
  rank: string;
  is_online: boolean;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, total_wins, total_losses, total_draws, total_credits, rank, is_online")
        .order("total_credits", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />;
      default:
        return <Trophy className="h-3 w-3 sm:h-5 sm:w-5 text-muted-foreground" />;
    }
  };

  const getWinsLeaderboard = () => {
    return [...users].sort((a, b) => b.total_wins - a.total_wins);
  };

  const getCreditsLeaderboard = () => {
    return [...users].sort((a, b) => b.total_credits - a.total_credits);
  };

  const UserRow = ({ user, position, showStat, statLabel }: {
    user: LeaderboardUser;
    position: number;
    showStat: number;
    statLabel: string;
  }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <div className="flex items-center justify-center w-6 sm:w-8">
          {getRankIcon(position)}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-battle rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            {(user.display_name || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base truncate">{user.display_name || user.username}</p>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <Badge variant="secondary" className="text-xs">{user.rank}</Badge>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs">{user.is_online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm sm:text-lg">{showStat.toLocaleString()}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">{statLabel}</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credits">Top Credits</TabsTrigger>
            <TabsTrigger value="wins">Most Wins</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="mt-4">
            <div className="space-y-3">
              {getCreditsLeaderboard().map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  position={index + 1}
                  showStat={user.total_credits}
                  statLabel="Credits"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wins" className="mt-4">
            <div className="space-y-3">
              {getWinsLeaderboard().map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  position={index + 1}
                  showStat={user.total_wins}
                  statLabel="Wins"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
