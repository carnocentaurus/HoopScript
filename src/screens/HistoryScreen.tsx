import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GameSave, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';

const HistoryItem = ({ item }: { item: SeasonHistory }) => (
  <View style={styles.historyCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.yearText}>S{item.seasonIndex} - {item.year}</Text>
      <Text style={styles.champText}>🏆 {item.champion.toUpperCase()}</Text>
    </View>

    <View style={styles.userSummary}>
      <Text style={styles.userStat}>{item.userRecord}</Text>
      <Text style={styles.userStat}>{item.userRank}</Text>
    </View>
  </View>
);

const HistoryScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={onBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CAREER HISTORY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {save.history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No finished seasons recorded yet.</Text>
          </View>
        ) : (
          [...save.history].reverse().map((item, idx) => (
            <HistoryItem key={idx} item={item} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerBack: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerBackText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  
  scrollContent: { padding: 15 },
  historyCard: { backgroundColor: '#111', borderRadius: 16, marginBottom: 15, padding: 20, borderWidth: 1, borderColor: '#222' },
  cardHeader: { flexDirection: 'column' },
  yearText: { color: '#C41E3A', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  champText: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 4 },
  
  userSummary: { flexDirection: 'row', gap: 15, marginTop: 12, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 12 },
  userStat: { color: '#888', fontSize: 13, fontWeight: 'bold' },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});

export default HistoryScreen;