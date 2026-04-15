import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Player, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';

interface TeamOverviewScreenProps {
  city: string;
  roster: Player[];
  history?: SeasonHistory[];
  onBack: () => void;
}

const TeamOverviewScreen = ({ city, roster, history, onBack }: TeamOverviewScreenProps) => {
  const starters = roster.filter(p => p.isStarter);
  const bench = roster.filter(p => !p.isStarter);
  const ratings = calculateTeamRatings(roster);

  const championships = history?.filter(h => h.champion === city).length || 0;

  const renderPlayerRow = (player: Player) => (
    <View style={styles.playerCard} key={player.id}>
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
        <Text style={styles.title}>{city.toUpperCase()}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.trophySection}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.trophyCount}>{championships}</Text>
          <Text style={styles.trophyLabel}>CHAMPIONSHIPS</Text>
        </View>

        <View style={styles.teamRatingsRow}>
          <View style={styles.teamRatingBox}><Text style={styles.teamRatingVal}>{ratings.offense}</Text><Text style={styles.teamRatingLabel}>OFF</Text></View>
          <View style={styles.teamRatingBox}><Text style={styles.teamRatingVal}>{ratings.defense}</Text><Text style={styles.teamRatingLabel}>DEF</Text></View>
          <View style={styles.teamRatingBox}><Text style={[styles.teamRatingVal, styles.teamOvrVal]}>{ratings.overall}</Text><Text style={styles.teamRatingLabel}>OVR</Text></View>
        </View>

        <Text style={styles.sectionHeader}>STARTERS</Text>
        {starters.map(p => renderPlayerRow(p))}

        <View style={{ height: 20 }} />
        <Text style={styles.sectionHeader}>BENCH</Text>
        {bench.map(p => renderPlayerRow(p))}
        
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

  teamRatingsRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 25, backgroundColor: '#F7FAFC', padding: 15, borderRadius: 12 },
  teamRatingBox: { alignItems: 'center' },
  teamRatingVal: { fontSize: 22, fontWeight: '900', color: '#2D3748' },
  teamOvrVal: { color: '#4A90E2' },
  teamRatingLabel: { fontSize: 9, color: '#718096', fontWeight: '800', marginTop: 2 },

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