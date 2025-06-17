
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSoundEffects = () => {
  const playSound = useCallback(async (soundType: 'correct' | 'incorrect' | 'win' | 'lose' | 'notification' | 'click' | 'countdown' | 'gameStart' | 'victory') => {
    try {
      // Check if user has sound enabled
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('sound_enabled')
        .eq('id', user.id)
        .single();

      if (!profile?.sound_enabled) return;

      // Create audio context and play sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const frequencies = {
        correct: [800, 1000, 1200],
        incorrect: [400, 300, 200],
        win: [523, 659, 784, 1047],
        lose: [330, 247, 196],
        notification: [800, 600],
        click: [600],
        countdown: [440, 440, 440, 880],
        gameStart: [523, 659, 784],
        victory: [523, 659, 784, 1047, 1319]
      };

      const freq = frequencies[soundType];
      
      for (let i = 0; i < freq.length; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq[i], audioContext.currentTime);
          oscillator.type = soundType === 'win' || soundType === 'victory' || soundType === 'gameStart' ? 'sine' : soundType === 'lose' ? 'sawtooth' : 'square';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }, i * 100);
      }
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, []);

  return { playSound };
};
