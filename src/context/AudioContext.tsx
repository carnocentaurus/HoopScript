import React, { createContext, useContext, ReactNode, useEffect, useState, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Platform, AppState, AppStateStatus } from 'react-native';

const clickSoundSource = require('../../assets/sounds/496760__malle99__click-tick-2.wav');
const bgMusicSource = require('../../assets/sounds/poradovskyi-basketball-nba-basketball-music-426800.mp3');

interface AudioContextType {
  isReady: boolean;
  playClickSound: () => void;
  startMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const clickPlayer = useAudioPlayer(clickSoundSource);
  const bgmPlayer = useAudioPlayer(bgMusicSource);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (bgmPlayer) {
      bgmPlayer.loop = true;
      bgmPlayer.volume = 0.3;
      // Initialize with shouldPlay: false is handled by not calling play() yet.
      setIsReady(true);
    }
  }, [bgmPlayer]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (Platform.OS === 'web') return;
      
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        if (bgmPlayer && !bgmPlayer.playing) {
          bgmPlayer.play();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        if (bgmPlayer && bgmPlayer.playing) {
          bgmPlayer.pause();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [bgmPlayer]);

  const playClickSound = () => {
    if (Platform.OS === 'web' || !clickPlayer) return;

    try {
      // expo-audio play() resets by default if we seek to 0 or it might just work.
      // The instruction says: "Resets the sound to position 0 (to allow rapid clicking)"
      if (clickPlayer.playing) {
        clickPlayer.seekTo(0);
      } else {
        clickPlayer.seekTo(0);
      }
      clickPlayer.play();
    } catch (error) {
      console.warn('Global SFX Error:', error);
    }
  };

  const startMusic = () => {
    if (Platform.OS === 'web' || !bgmPlayer) return;
    try {
      if (!bgmPlayer.playing) {
        bgmPlayer.play();
      }
    } catch (error) {
      console.warn('BGM Play Error:', error);
    }
  };

  return (
    <AudioContext.Provider value={{ isReady, playClickSound, startMusic }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
