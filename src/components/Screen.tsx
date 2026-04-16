import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[]; // Allows you to pass custom styles
}

export default function Screen({ children, style }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        globalStyles.container, 
        { 
          paddingTop: insets.top, 
          paddingBottom: insets.bottom 
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
}