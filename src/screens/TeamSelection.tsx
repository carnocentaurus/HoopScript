import React from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import TeamCard from '../components/TeamCard';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { useSound } from '../hooks/useSound';

const TEAMS = [
  "Atlanta", "Boston", "Brooklyn", "Charlotte", "Chicago", 
  "Cleveland", "Dallas", "Denver", "Detroit", "Houston", 
  "Indiana", "Los Angeles", "Memphis", "Miami", "Milwaukee", 
  "Minnesota", "New Orleans", "New York", "Oklahoma City", "Orlando", 
  "Philadelphia", "Phoenix", "Portland", "Sacramento", "San Antonio", 
  "San Diego", "San Francisco", "Toronto", "Utah", "Washington"
].sort();

const TeamSelection = ({ onSelectTeam, onBack }: { onSelectTeam: (team: string) => void, onBack: () => void }) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <Screen>
      <View style={globalStyles.tsHeaderRow}>
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.tsBackBtn}>
          <Icon name="chevron-back" size={30} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={globalStyles.tsHeader}>Select Your Team</Text>
        <View style={globalStyles.headerSpacer} />
      </View>
      <FlatList
        data={TEAMS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TeamCard city={item} onPress={() => handlePress(() => onSelectTeam(item))} />
        )}
        contentContainerStyle={globalStyles.tsListContent}
      />
    </Screen>
  );
};

export default TeamSelection;