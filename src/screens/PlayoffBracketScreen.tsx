import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { GameSave } from '../types/save';

const PlayoffBracketScreen = ({ save, onSimDay, onBack }: { save: GameSave, onSimDay: () => void, onBack: () => void }) => {
  const currentRound = save.playoffs?.round || 1;
  const roundMatchups = save.playoffBracket?.filter(s => s.round === currentRound) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← HOME</Text></TouchableOpacity>
        <Text style={styles.title}>ROUND {currentRound}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {roundMatchups.map((series) => (
          <View key={series.id} style={styles.seriesCard}>
            <View style={styles.teamRow}>
              <Text style={[styles.teamName, series.highSeedWins === 4 && styles.winner]}>{series.highSeed}</Text>
              <Text style={styles.score}>{series.highSeedWins}</Text>
            </View>
            <View style={styles.teamRow}>
              <Text style={[styles.teamName, series.lowSeedWins === 4 && styles.winner]}>{series.lowSeed}</Text>
              <Text style={styles.score}>{series.lowSeedWins}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {save.playoffs?.isEliminated && (
        <TouchableOpacity style={styles.simDayBtn} onPress={onSimDay}>
          <Text style={styles.simDayBtnText}>SIMULATE DAY</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backText: { fontWeight: 'bold', color: '#4A90E2' },
  title: { fontSize: 18, fontWeight: '900', color: '#2D3748' },
  content: { padding: 16 },
  seriesCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  teamName: { fontSize: 16, fontWeight: '700', color: '#4A5568' },
  winner: { color: '#4A90E2' },
  score: { fontSize: 16, fontWeight: '900', color: '#2D3748' },
  simDayBtn: { backgroundColor: '#2D3748', margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  simDayBtnText: { color: '#FFF', fontWeight: 'bold' }
});

export default PlayoffBracketScreen;