
import FriendSearch from "@/components/FriendSearch";
import FriendsList from "@/components/FriendsList";

interface FriendsProps {
  currentUserId: string;
}

const Friends = ({ currentUserId }: FriendsProps) => {
  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-6 text-center">
          Friends & Social
        </h1>
        
        <FriendSearch currentUserId={currentUserId} />
        <FriendsList currentUserId={currentUserId} />
      </div>
    </div>
  );
};

export default Friends;
