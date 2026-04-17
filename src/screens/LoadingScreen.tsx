import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/icon/hoopscript_icon_no_bg.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;