import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameSave } from '../types/save';

const HomeScreen = ({ save, onQuickSim }: { save: GameSave, onQuickSim: () => void }) => {
  // Dummy data for next opponent - later this will come from a schedule engine
  const opponent = {
    city: "Chicago",
    record: "12-8",
    rank: "4th",
    isHome: false
  };

  const getRankSuffix = (n: number) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* My Team Section */}
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{save.city}</Text>
        <Text style={styles.teamSub}>{getRankSuffix(save.rank)} in {save.conference}</Text>
        <Text style={styles.recordText}>{save.wins}-{save.losses}</Text>
      </View>

      {/* Opponent Card */}
      <View style={styles.opponentCard}>
        <Text style={styles.sectionLabel}>NEXT OPPONENT</Text>
        <View style={styles.oppRow}>
          <View>
            <Text style={styles.oppCity}>{opponent.city}</Text>
            <Text style={styles.oppSub}>{opponent.rank} | {opponent.record}</Text>
          </View>
          <Text style={styles.venueText}>{opponent.isHome ? "HOME" : "AWAY"}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>SEASON PROGRESS</Text>
        <Text style={styles.statsText}>{save.gamesPlayed} GP / {save.totalGames - save.gamesPlayed} GL</Text>
      </View>

      <TouchableOpacity style={styles.simButton} onPress={onQuickSim}>
        <Text style={styles.simButtonText}>QUICK SIM</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  teamHeader: { padding: 40, alignItems: 'center', backgroundColor: '#F9F9F9' },
  teamName: { fontSize: 32, fontWeight: '900' },
  teamSub: { color: '#666', marginTop: 5 },
  recordText: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  opponentCard: { margin: 20, padding: 20, borderRadius: 15, backgroundColor: '#111' },
  sectionLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  oppRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  oppCity: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  oppSub: { color: '#AAA', fontSize: 12 },
  venueText: { color: '#444', fontWeight: '900' },
  progressSection: { alignItems: 'center', marginTop: 20 },
  progressText: { fontSize: 10, color: '#999', letterSpacing: 1 },
  statsText: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  simButton: { backgroundColor: '#000', margin: 20, padding: 20, borderRadius: 10, alignItems: 'center', position: 'absolute', bottom: 40, left: 0, right: 0 },
  simButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});

export default HomeScreen;