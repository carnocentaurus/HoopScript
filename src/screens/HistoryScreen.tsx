import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameSave, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';

const HistoryItem = ({ item }: { item: SeasonHistory }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.historyCard}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.cardHeader}>
        <View>
          <Text style={styles.yearText}>S{item.seasonIndex} - {item.year}</Text>
          <Text style={styles.champText}>🏆 {item.champion.toUpperCase()}</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? "−" : "+"}</Text>
      </TouchableOpacity>

      <View style={styles.userSummary}>
        <Text style={styles.userStat}>{item.userRecord}</Text>
        <Text style={styles.userStat}>{item.userRank}</Text>
      </View>

      {expanded && (
        <View style={styles.expandedDetails}>
          <Text style={styles.awardsHeader}>AWARDS</Text>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>MVP</Text>
            <Text style={styles.awardWinner}>{item.awards.mvp.playerName} ({item.awards.mvp.teamCity})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>DPOY</Text>
            <Text style={styles.awardWinner}>{item.awards.dpoy.playerName} ({item.awards.dpoy.teamCity})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>ROTY</Text>
            <Text style={styles.awardWinner}>{item.awards.roty.playerName} ({item.awards.roty.teamCity})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>6MOTY</Text>
            <Text style={styles.awardWinner}>{item.awards.sixMan.playerName} ({item.awards.sixMan.teamCity})</Text>
          </View>
          
          <Text style={styles.awardsHeader}>STAT LEADERS</Text>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>PTS</Text>
            <Text style={styles.awardWinner}>{item.awards.ptsLeader.playerName} ({item.awards.ptsLeader.value})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>REB</Text>
            <Text style={styles.awardWinner}>{item.awards.rebLeader.playerName} ({item.awards.rebLeader.value})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>AST</Text>
            <Text style={styles.awardWinner}>{item.awards.astLeader.playerName} ({item.awards.astLeader.value})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>STL</Text>
            <Text style={styles.awardWinner}>{item.awards.stlLeader.playerName} ({item.awards.stlLeader.value})</Text>
          </View>
          <View style={styles.awardRow}>
            <Text style={styles.awardLabel}>BLK</Text>
            <Text style={styles.awardWinner}>{item.awards.blkLeader.playerName} ({item.awards.blkLeader.value})</Text>
          </View>
        </View>
      )}
    </View>
  );
};

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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearText: { color: '#C41E3A', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  champText: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 4 },
  expandIcon: { color: '#666', fontSize: 24, fontWeight: 'bold' },
  
  userSummary: { flexDirection: 'row', gap: 15, marginTop: 12, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 12 },
  userStat: { color: '#888', fontSize: 13, fontWeight: 'bold' },

  expandedDetails: { marginTop: 20, backgroundColor: '#0A0A0A', padding: 15, borderRadius: 12 },
  awardsHeader: { color: '#C41E3A', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, marginTop: 5 },
  awardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  awardLabel: { color: '#555', fontSize: 11, fontWeight: 'bold' },
  awardWinner: { color: '#CCC', fontSize: 11, fontWeight: '800' },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});

export default HistoryScreen;
