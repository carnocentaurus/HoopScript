import { useAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

const clickSoundSource = require('../../assets/sounds/496760__malle99__click-tick-2.wav');

/**
 * Optimized useSound hook.
 * Reusing a single AudioPlayer instance is critical in expo-audio to avoid
 * "Too many open files" or system resource exhaustion errors that cause 
 * sound to stop playing after extended use.
 */
export const useSound = () => {
  const player = useAudioPlayer(clickSoundSource);

  const playClickSound = async () => {
    if (Platform.OS === 'web' || !player) return;

    try {
      // If sound is already playing (rapid clicks), restart it for better feedback
      if (player.playing) {
        player.seekTo(0);
      } else {
        player.play();
      }
    } catch (error) {
      // Non-blocking warning
      console.warn('Click sound failed:', error);
    }
  };

  return { playClickSound };
};
