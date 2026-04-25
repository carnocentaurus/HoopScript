import React, { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

const bgMusicSource = require('../../assets/sounds/poradovskyi-basketball-nba-basketball-music-426800.mp3');

const BackgroundMusic = () => {
  const player = useAudioPlayer(bgMusicSource);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    player.loop = true;
    player.volume = 0.3;
    player.play();

    return () => {
      player.pause();
    };
  }, [player]);

  return null;
};

export default BackgroundMusic;
