import { useSoundContext } from '../context/SoundContext';

/**
 * Hook to access the globally managed click sound.
 * This prevents resource exhaustion and ensuring reliability across 
 * app background/foreground transitions.
 */
export const useSound = () => {
  const { playClickSound } = useSoundContext();
  return { playClickSound };
};