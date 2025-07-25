
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Common words for validation
const commonWords = [
  "apple", "elephant", "tiger", "rain", "night", "tree", "egg", "gold", "dog", "game",
  "mouse", "sun", "net", "top", "pen", "note", "earth", "hat", "table", "energy",
  "yellow", "water", "road", "dance", "eye", "green", "nest", "time", "end",
  "door", "rock", "key", "yarn", "new", "wind", "duck", "king", "garden", "north",
  "cat", "bat", "rat", "hat", "mat", "fat", "sat", "pat", "vat", "chat",
  "car", "bar", "far", "jar", "tar", "war", "star", "scar", "char", "czar",
  "book", "look", "took", "cook", "hook", "nook", "brook", "crook", "shook",
  "great", "eat", "team", "mean", "near", "dear", "year", "hear", "clear", "tear",
  "word", "lord", "ford", "cord", "sword", "board", "heard", "world", "bird"
];

// Category words
const categoryWords = {
  Animals: ["lion", "tiger", "elephant", "giraffe", "zebra", "monkey", "bear", "wolf", "fox", "rabbit"],
  Countries: ["france", "japan", "brazil", "canada", "germany", "italy", "spain", "mexico", "india", "china"],
  Food: ["pizza", "burger", "pasta", "sushi", "salad", "cake", "bread", "rice", "soup", "fruit"],
  Movies: ["avatar", "titanic", "batman", "superman", "starwars", "marvel", "disney", "action", "comedy", "drama"],
  Sports: ["football", "basketball", "tennis", "swimming", "running", "boxing", "golf", "baseball", "soccer", "hockey"],
  Colors: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown"],
  Fruits: ["apple", "banana", "orange", "mango", "grape", "strawberry", "pineapple", "watermelon", "kiwi", "peach"]
};

export const useGameLogic = () => {
  const [submitting, setSubmitting] = useState(false);

  const isValidWord = useCallback((word: string, gameMode: string, category: string, lastWord: string, wordsUsed: string[]): boolean => {
    const lowerWord = word.toLowerCase().trim();
    
    // Check if word was already used
    if (wordsUsed.includes(lowerWord)) {
      return false;
    }
    
    if (gameMode === 'wordchain') {
      // For word chain, check if word exists and follows chain rules
      const isValidEnglishWord = commonWords.includes(lowerWord) || lowerWord.length >= 3;
      
      if (!lastWord) {
        // First word can be any valid word
        return isValidEnglishWord;
      }
      
      const lastLetter = lastWord[lastWord.length - 1].toLowerCase();
      const firstLetter = lowerWord[0].toLowerCase();
      
      return firstLetter === lastLetter && isValidEnglishWord;
    } else {
      // For category mode, check if word belongs to category
      const categoryWordList = categoryWords[category as keyof typeof categoryWords] || [];
      return categoryWordList.includes(lowerWord);
    }
  }, []);

  const calculatePoints = useCallback((word: string, timeTaken: number): number => {
    let basePoints = 15; // Base 15 credits for word chain as requested
    
    // Bonus for longer words (5 points per extra letter beyond 3)
    if (word.length > 3) {
      basePoints += (word.length - 3) * 5;
    }
    
    // Speed bonus (faster = more points, up to 15 bonus points)
    const speedBonus = Math.max(0, Math.min(15, (30 - timeTaken) * 0.5));
    
    return Math.floor(basePoints + speedBonus);
  }, []);

  const submitWord = useCallback(async (
    word: string,
    gameSession: any,
    gameId: string,
    currentUserId: string,
    turnStartTime: Date | null,
    onSuccess: (word: string, points: number) => void
  ) => {
    if (submitting) return false;
    
    setSubmitting(true);
    try {
      // Calculate time taken and points
      const timeTaken = turnStartTime ? Math.floor((new Date().getTime() - turnStartTime.getTime()) / 1000) : 30;
      const points = calculatePoints(word, timeTaken);
      
      // Add move to database
      const { error: moveError } = await supabase
        .from("game_moves")
        .insert({
          game_id: gameId,
          player_id: currentUserId,
          word: word,
          points_earned: points,
          is_valid: true,
          time_taken: timeTaken
        });

      if (moveError) throw moveError;

      // Update game session
      const opponentId = gameSession.player1_id === currentUserId ? gameSession.player2_id : gameSession.player1_id;
      const currentScore = gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score;
      const newScore = currentScore + points;
      
      const updates: any = {
        current_turn: opponentId,
        words_used: [...gameSession.words_used, word],
        turn_time_limit: 30
      };

      if (gameSession.player1_id === currentUserId) {
        updates.player1_score = newScore;
      } else {
        updates.player2_score = newScore;
      }

      // Don't end game based on score, let it continue for full 3 minutes
      // Only end if time runs out or manually ended
      
      const { error: updateError } = await supabase
        .from("game_sessions")
        .update(updates)
        .eq("id", gameId);

      if (updateError) throw updateError;

      onSuccess(word, points);
      return true;
      
    } catch (error) {
      console.error("Error submitting word:", error);
      toast({
        title: "Error",
        description: "Failed to submit word",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [submitting, calculatePoints]);

  return {
    isValidWord,
    calculatePoints,
    submitWord,
    submitting
  };
};
