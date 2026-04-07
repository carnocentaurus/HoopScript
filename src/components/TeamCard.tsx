import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface TeamCardProps {
  city: string;
  onPress: () => void;
}

const TeamCard = ({ city, onPress }: TeamCardProps) => {
  const initial = city.charAt(0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>{initial}</Text>
      </View>
      <Text style={styles.cityText}>{city}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    margin: 8,
    paddingVertical: 10,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '600',
  },
  cityText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TeamCard;