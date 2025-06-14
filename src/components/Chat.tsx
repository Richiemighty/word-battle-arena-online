
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    display_name: string;
  };
  receiver: {
    id: string;
    username: string;
    display_name: string;
  };
}

interface Friend {
  id: string;
  username: string;
  display_name: string;
  is_online: boolean;
}

interface ChatProps {
  currentUserId: string;
}

const Chat = ({ currentUserId }: ChatProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
    }
  }, [selectedFriend, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, is_online),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, is_online)
        `)
        .eq("status", "accepted")
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

      if (error) throw error;

      const friendsList = data?.map(friendship => {
        return friendship.requester.id === currentUserId 
          ? friendship.addressee 
          : friendship.requester;
      }) || [];

      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          id,
          message,
          created_at,
          sender:profiles!chat_messages_sender_id_fkey(id, username, display_name),
          receiver:profiles!chat_messages_receiver_id_fkey(id, username, display_name)
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedFriend.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedFriend.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const backToFriendsList = () => {
    setSelectedFriend(null);
    setMessages([]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading chat...</div>;
  }

  return (
    <div className="h-[600px]">
      {!selectedFriend ? (
        // Friends List View
        <Card className="bg-gradient-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chat with Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No friends to chat with yet.
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <Card
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 border-transparent hover:border-primary/20`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-battle rounded-full flex items-center justify-center text-white font-bold">
                          {(friend.display_name || friend.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{friend.display_name || friend.username}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            {friend.is_online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Chat Room View
        <Card className="bg-gradient-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={backToFriendsList}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <MessageCircle className="h-5 w-5" />
              Chat with {selectedFriend.display_name || selectedFriend.username}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender.id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p>{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="bg-input border-border focus:border-primary"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chat;
