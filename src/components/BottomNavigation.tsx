
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Gamepad2, Users, Trophy, MessageCircle } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const { playSound } = useSoundEffects();

  const handleTabChange = async (tab: string) => {
    await playSound('click');
    onTabChange(tab);
  };

  const tabs = [
    { id: 'home', label: 'Statistics', icon: Home },
    { id: 'practice', label: 'Practice', icon: Gamepad2 },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'board', label: 'Board', icon: Trophy },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
