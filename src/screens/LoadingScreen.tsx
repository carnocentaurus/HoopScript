import React from 'react';
import { View, Image } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const LoadingScreen = () => {
  return (
    <View style={globalStyles.loadingContainer}>
      <Image 
        source={require('../../assets/images/icon/hoopscript_icon_no_bg.webp')} 
        style={globalStyles.loadingLogo}
        resizeMode="contain"
      />
    </View>
  );
};

export default LoadingScreen;