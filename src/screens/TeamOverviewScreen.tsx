import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
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

  const renderPlayerRow = (player: Player) => {
    const avg = (val: number) => ((val || 0) / Math.max(1, player.stats.gamesPlayed)).toFixed(1);

    return (
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

        <View style={styles.statsDivider} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.pts)}</Text><Text style={styles.statLabel}>PTS</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.threePM)}</Text><Text style={styles.statLabel}>3PM</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.reb)}</Text><Text style={styles.statLabel}>REB</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.oreb)}</Text><Text style={styles.statLabel}>OREB</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.dreb)}</Text><Text style={styles.statLabel}>DREB</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.ast)}</Text><Text style={styles.statLabel}>AST</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.stl)}</Text><Text style={styles.statLabel}>STL</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.blk)}</Text><Text style={styles.statLabel}>BLK</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.tov)}</Text><Text style={styles.statLabel}>TOV</Text></View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, player.stats.plusMinus > 0 ? {color: '#4CAF50'} : player.stats.plusMinus < 0 ? {color: '#E53E3E'} : {}]}>
              {player.stats.plusMinus > 0 ? `+${avg(player.stats.plusMinus)}` : avg(player.stats.plusMinus)}
            </Text>
            <Text style={styles.statLabel}>+/-</Text>
          </View>
          <View style={styles.statItem}><Text style={styles.statVal}>{avg(player.stats.min)}</Text><Text style={styles.statLabel}>MIN</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{player.stats.gamesPlayed}</Text><Text style={styles.statLabel}>GP</Text></View>
        </ScrollView>
      </View>
    );
  };

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
        {/* Championships Badge */}
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

  statsDivider: { height: 1, backgroundColor: '#F7FAFC', marginVertical: 10 },
  statsScroll: { flexDirection: 'row' },
  statItem: { marginRight: 15, alignItems: 'center', minWidth: 35 },
  statVal: { fontSize: 13, fontWeight: '900', color: '#4A5568' },
  statLabel: { fontSize: 8, color: '#CBD5E0', fontWeight: 'bold' }
});

export default TeamOverviewScreen;
