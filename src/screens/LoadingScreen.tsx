import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      {/* Replace Text with <Image source={...} /> when logo is ready */}
      <Text style={styles.logoText}>HOOPSCRIPT</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid background as requested
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});

export default LoadingScreen;