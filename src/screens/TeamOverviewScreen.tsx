import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GameSave, Player } from '../types/save';
import Screen from '../components/Screen';

interface TeamOverviewScreenProps {
  save: GameSave;
  onBack: () => void;
}

const TeamOverviewScreen = ({ save, onBack }: TeamOverviewScreenProps) => {
  const starters = save.roster.filter(p => p.isStarter);
  const bench = save.roster.filter(p => !p.isStarter);

  const championships = save.history?.filter(h => h.champion === save.city).length || 0;

  const renderPlayerRow = (player: Player) => (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerMain}>{player.lastName} <Text style={styles.playerNum}>#{player.number}</Text></Text>
        <Text style={styles.playerPos}>{player.position}</Text>
      </View>
      
      <View style={styles.ratingsRow}>
        <View style={styles.ratingItem}><Text style={styles.ratingVal}>{player.age}</Text><Text style={styles.ratingLabel}>AGE</Text></View>
        <View style={styles.ratingItem}><Text style={styles.ratingVal}>{player.offense}</Text><Text style={styles.ratingLabel}>OFF</Text></View>
        <View style={styles.ratingItem}><Text style={styles.ratingVal}>{player.defense}</Text><Text style={styles.ratingLabel}>DEF</Text></View>
        <View style={styles.ratingItem}><Text style={[styles.ratingVal, styles.ovrVal]}>{player.overall}</Text><Text style={styles.ratingLabel}>OVR</Text></View>
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>TEAM OVERVIEW</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.trophySection}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.trophyCount}>{championships}</Text>
          <Text style={styles.trophyLabel}>CHAMPIONSHIPS</Text>
        </View>

        <Text style={styles.sectionHeader}>STARTERS</Text>
        {starters.map(p => <View key={p.id}>{renderPlayerRow(p)}</View>)}

        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>BENCH</Text>
        {bench.map(p => <View key={p.id}>{renderPlayerRow(p)}</View>)}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  backBtn: { width: 60 },
  backBtnText: { color: '#4A90E2', fontWeight: 'bold' },
  title: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  container: { flex: 1, paddingHorizontal: 15 },
  
  trophySection: { alignItems: 'center', backgroundColor: '#1A202C', padding: 20, borderRadius: 15, marginVertical: 15 },
  trophyIcon: { fontSize: 32 },
  trophyCount: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 5 },
  trophyLabel: { color: '#A0AEC0', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  sectionHeader: { color: '#2D3748', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 10, marginLeft: 5 },
  
  playerCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7', elevation: 2 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  playerMain: { fontSize: 18, fontWeight: '900', color: '#1A202C' },
  playerNum: { color: '#C41E3A', fontSize: 14 },
  playerPos: { color: '#718096', fontWeight: 'bold', fontSize: 12 },
  
  ratingsRow: { flexDirection: 'row', gap: 15 },
  ratingItem: { alignItems: 'center' },
  ratingVal: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  ovrVal: { color: '#4A90E2' },
  ratingLabel: { fontSize: 8, color: '#A0AEC0', fontWeight: 'bold' },
});

export default TeamOverviewScreen;