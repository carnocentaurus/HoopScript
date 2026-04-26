import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

const clickSoundSource = require('../../assets/sounds/496760__malle99__click-tick-2.wav');

interface SoundContextType {
  playClickSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const player = useAudioPlayer(clickSoundSource);

  const playClickSound = () => {
    if (Platform.OS === 'web' || !player) return;

    try {
      if (player.playing) {
        player.seekTo(0);
      }
      player.play();
    } catch (error) {
      console.warn('Global SFX Error:', error);
    }
  };

  return (
    <SoundContext.Provider value={{ playClickSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
};