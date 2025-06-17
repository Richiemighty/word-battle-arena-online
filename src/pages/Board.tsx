
import Leaderboard from "@/components/Leaderboard";

const Board = () => {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-6 text-center">
          Global Leaderboard
        </h1>
        
        <Leaderboard />
      </div>
    </div>
  );
};

export default Board;
