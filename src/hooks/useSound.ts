import { useAudioContext } from '../context/AudioContext';

/**
 * Hook to access the globally managed click sound.
 * This prevents resource exhaustion and ensuring reliability across 
 * app background/foreground transitions.
 */
export const useSound = () => {
  const { playClickSound } = useAudioContext();
  
  return { 
    playClick: playClickSound,
    playClickSound: playClickSound // Alias for backward compatibility
  };
};

/**
 * Alias hook for SFX as requested in prompt "useSoundEffects"
 */
export const useSoundEffects = () => {
  const { playClickSound } = useAudioContext();
  return { playClick: playClickSound };
};
