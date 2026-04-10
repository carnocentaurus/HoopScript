import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import TeamCard from '../components/TeamCard';
import Screen from '../components/Screen';

const TEAMS = [
  "Atlanta", "Boston", "Brooklyn", "Charlotte", "Chicago", 
  "Cleveland", "Dallas", "Denver", "Detroit", "Houston", 
  "Indiana", "Los Angeles", "Memphis", "Miami", "Milwaukee", 
  "Minnesota", "New Orleans", "New York", "Oklahoma City", "Orlando", 
  "Philadelphia", "Phoenix", "Portland", "Sacramento", "San Antonio", 
  "San Diego", "San Francisco", "Toronto", "Utah", "Washington"
].sort();

const TeamSelection = ({ onSelectTeam }: { onSelectTeam: (team: string) => void }) => {
  return (
    <Screen>
      <Text style={styles.header}>Select Your Team</Text>
      <FlatList
        data={TEAMS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TeamCard city={item} onPress={() => onSelectTeam(item)} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 10,
  },
});

export default TeamSelection;