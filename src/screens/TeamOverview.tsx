import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { generateRoster, Player } from '../utils/rosterGenerator';
import Screen from '../components/Screen';

const TeamOverview = ({ city, onConfirm, onBack }: { city: string, onConfirm: () => void, onBack: () => void }) => {
  // Memoize the roster so it doesn't re-randomize on every render
  const roster = useMemo(() => generateRoster(city), [city]);
  
  const offRating = Math.floor(Math.random() * 20) + 75;
  const defRating = Math.floor(Math.random() * 20) + 75;
  const overall = Math.floor((offRating + defRating) / 2);

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerRow}>
      <Text style={styles.playerPos}>{item.position}</Text>
      <Text style={styles.playerName}>{item.lastName}</Text>
      <Text style={styles.playerNum}>#{item.number}</Text>
      <Text style={[styles.playerRate, { color: item.isStarter ? '#2E7D32' : '#757575' }]}>
        {item.overall}
      </Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
        <Text style={styles.cityTitle}>{city.toUpperCase()}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statVal}>{offRating}</Text><Text style={styles.statLabel}>OFF</Text></View>
          <View style={styles.statBox}><Text style={styles.statVal}>{defRating}</Text><Text style={styles.statLabel}>DEF</Text></View>
          <View style={styles.statBox}><Text style={styles.statVal}>{overall}</Text><Text style={styles.statLabel}>OVR</Text></View>
        </View>
      </View>

      <FlatList
        data={roster}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        ListHeaderComponent={<Text style={styles.sectionHeader}>TEAM ROSTER</Text>}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmText}>CONFIRM TEAM</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topRow: { flexDirection: 'row', width: '100%', marginBottom: 10 },
  backBtn: { padding: 5 },
  backBtnText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 12 },
  cityTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', marginTop: 15, width: '100%', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#666' },
  sectionHeader: { padding: 15, backgroundColor: '#F8F8F8', fontWeight: 'bold', fontSize: 12, color: '#888' },
  playerRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  playerPos: { width: 30, fontWeight: 'bold', color: '#444' },
  playerName: { flex: 1, fontSize: 16 },
  playerNum: { width: 40, color: '#999' },
  playerRate: { width: 30, fontWeight: 'bold', textAlign: 'right' },
  confirmButton: { backgroundColor: '#000', margin: 20, padding: 18, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default TeamOverview;