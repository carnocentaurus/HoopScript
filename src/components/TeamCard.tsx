import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface TeamCardProps {
  city: string;
  onPress: () => void;
}

const TeamCard = ({ city, onPress }: TeamCardProps) => {
  const logo = TEAM_LOGOS[city];
  const { playClickSound } = useSound();

  const handlePress = () => {
    playClickSound();
    onPress();
  };

  return (
    <TouchableOpacity style={globalStyles.tcCard} onPress={handlePress}>
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