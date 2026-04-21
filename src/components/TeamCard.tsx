import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { TEAM_LOGOS } from '../data/teams';

interface TeamCardProps {
  city: string;
  onPress: () => void;
}

const TeamCard = ({ city, onPress }: TeamCardProps) => {
  const logo = TEAM_LOGOS[city];

  return (
    <TouchableOpacity style={globalStyles.tcCard} onPress={onPress}>
      <View style={globalStyles.tcLogoCircle}>
        {logo ? (
          <Image source={logo} style={globalStyles.tcLogoImage} />
        ) : (
          <Text style={globalStyles.tcLogoLetter}>{city.charAt(0)}</Text>
        )}
      </View>
      <Text style={globalStyles.tcCityText}>{city}</Text>
    </TouchableOpacity>
  );
};

export default TeamCard;