import React, { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

const bgMusicSource = require('../../assets/sounds/poradovskyi-basketball-nba-basketball-music-426800.mp3');

const BackgroundMusic = () => {
  const player = useAudioPlayer(bgMusicSource);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const startPlayback = async () => {
      try {
        player.loop = true;
        player.volume = 0.3;
        player.play();
      } catch (e) {
        console.log('BG Music Play Error:', e);
      }
    };

    startPlayback();

    return () => {
      try {
        if (player && player.playing) {
          player.pause();
        }
      } catch (e) {
        // Ignore errors during unmount
      }
    };
  }, [player]);

  return null;
};

export default BackgroundMusic;
