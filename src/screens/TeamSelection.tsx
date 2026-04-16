import React from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import TeamCard from '../components/TeamCard';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';

const TEAMS = [
  "Atlanta", "Boston", "Brooklyn", "Charlotte", "Chicago", 
  "Cleveland", "Dallas", "Denver", "Detroit", "Houston", 
  "Indiana", "Los Angeles", "Memphis", "Miami", "Milwaukee", 
  "Minnesota", "New Orleans", "New York", "Oklahoma City", "Orlando", 
  "Philadelphia", "Phoenix", "Portland", "Sacramento", "San Antonio", 
  "San Diego", "San Francisco", "Toronto", "Utah", "Washington"
].sort();

const TeamSelection = ({ onSelectTeam, onBack }: { onSelectTeam: (team: string) => void, onBack: () => void }) => {
  return (
    <Screen>
      <View style={globalStyles.tsHeaderRow}>
        <TouchableOpacity onPress={onBack} style={globalStyles.tsBackBtn}>
          <Text style={globalStyles.tsBackBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={globalStyles.tsHeader}>Select Your Team</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={TEAMS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TeamCard city={item} onPress={() => onSelectTeam(item)} />
        )}
        contentContainerStyle={globalStyles.tsListContent}
      />
    </Screen>
  );
};

export default TeamSelection;