import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Platform } from 'react-native';

const clickSoundSource = require('../../assets/sounds/mixkit-game-ball-tap-2073.wav');

export const useSound = () => {
  const player = useAudioPlayer(clickSoundSource);
  const status = useAudioPlayerStatus(player);

  const playClickSound = async () => {
    if (Platform.OS === 'web') return;

    try {
      if (player.playing) {
        player.seekTo(0);
      }
      player.play();
    } catch (error) {
      console.log('Error playing sound with expo-audio:', error);
    }
  };

  return { playClickSound };
};
