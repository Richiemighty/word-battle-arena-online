
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  is_online: boolean;
  avatar_id: string | null;
  avatars?: {
    emoji: string;
  };
}

interface Message {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatProps {
  currentUserId: string;
}

const Chat = ({ currentUserId }: ChatProps) => {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffects();

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(
            id, username, display_name, is_online, avatar_id,
            avatars(emoji)
          ),
          addressee:profiles!friendships_addressee_id_fkey(
            id, username, display_name, is_online, avatar_id,
            avatars(emoji)
          )
        `)
        .eq("status", "accepted")
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

      if (error) throw error;

      const friendsList = data?.map((friendship: any) => {
        return friendship.requester_id === currentUserId 
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

  const fetchMessages = async () => {
    if (!selectedFriend) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedFriend) return;

    try {
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("sender_id", selectedFriend.id)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      await playSound('click');
      
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          message: newMessage.trim(),
          sender_id: currentUserId,
          receiver_id: selectedFriend.id,
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
      
      toast({
        title: "Message sent",
        description: `Message sent to ${selectedFriend.display_name || selectedFriend.username}`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  // Show friend list when no friend is selected
  if (!selectedFriend) {
    return (
      <Card className="bg-gradient-card h-[600px] max-h-[80vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No friends to chat with yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some friends to start conversations!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[450px]">
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-battle rounded-full flex items-center justify-center">
                      {friend.avatars?.emoji ? (
                        <span className="text-lg">{friend.avatars.emoji}</span>
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {friend.display_name || friend.username}
                        </p>
                        <div className={`w-2 h-2 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {friend.is_online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show chat room when friend is selected
  return (
    <Card className="bg-gradient-card h-[600px] max-h-[80vh] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFriend(null)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-gradient-battle rounded-full flex items-center justify-center">
            {selectedFriend.avatars?.emoji ? (
              <span className="text-sm">{selectedFriend.avatars.emoji}</span>
            ) : (
              <span className="text-sm">👤</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base">
              {selectedFriend.display_name || selectedFriend.username}
            </h3>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${selectedFriend.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-muted-foreground">
                {selectedFriend.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <p className="break-words">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;
