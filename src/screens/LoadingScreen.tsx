import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const LoadingScreen = () => {
  return (
    <View style={[globalStyles.whiteContainer, { justifyContent: 'center', alignItems: 'center' }]}>
      {/* Replace Text with <Image source={...} /> when logo is ready */}
      <Text style={globalStyles.loadingLogoText}>HOOPSCRIPT</Text>
    </View>
  );
};

export default LoadingScreen;