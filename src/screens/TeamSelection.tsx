import React from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView } from 'react-native';
import TeamCard from '../components/TeamCard';

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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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