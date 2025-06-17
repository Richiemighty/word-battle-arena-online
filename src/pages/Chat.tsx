
import Chat from "@/components/Chat";

interface ChatPageProps {
  currentUserId: string;
}

const ChatPage = ({ currentUserId }: ChatPageProps) => {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-6 text-center">
          Global Chat
        </h1>
        
        <Chat currentUserId={currentUserId} />
      </div>
    </div>
  );
};

export default ChatPage;
