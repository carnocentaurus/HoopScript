import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface TeamCardProps {
  city: string;
  onPress: () => void;
}

const TeamCard = ({ city, onPress }: TeamCardProps) => {
  const initial = city.charAt(0);

  return (
    <TouchableOpacity style={globalStyles.tcCard} onPress={onPress}>
      <View style={globalStyles.tcLogoCircle}>
        <Text style={globalStyles.tcLogoLetter}>{initial}</Text>
      </View>
      <Text style={globalStyles.tcCityText}>{city}</Text>
    </TouchableOpacity>
  );
};

export default TeamCard;