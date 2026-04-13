import React from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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

const TeamSelection = ({ onSelectTeam, onBack }: { onSelectTeam: (team: string) => void, onBack: () => void }) => {
  return (
    <Screen>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Select Your Team</Text>
        <View style={{ width: 60 }} />
      </View>
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
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backBtn: {
    padding: 10,
    width: 60,
  },
  backBtnText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 10,
  },
});

export default TeamSelection;