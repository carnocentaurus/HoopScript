import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export const useSound = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playClickSound() {
    // Basic check for web or environments where expo-av might not be fully ready
    // or if the native module is missing to prevent total app crash
    try {
      if (Platform.OS === 'web') return; 

      if (sound) {
        await sound.replayAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/mixkit-game-ball-tap-2073.wav')
        );
        setSound(newSound);
        await newSound.playAsync();
      }
    } catch (error) {
      // If native module is missing, it might throw before we can catch it in some versions,
      // but wrapping in try/catch is the standard defense.
      console.log('Error playing sound (likely missing native module):', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { playClickSound };
};
