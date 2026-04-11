import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameSave, SeasonAwards } from '../types/save';
import Screen from '../components/Screen';

const AwardCard = ({ 
  title, 
  winner, 
  suffix = "", 
  showValue = true 
}: { 
  title: string, 
  winner: any, 
  suffix?: string,
  showValue?: boolean 
}) => (
  <View style={styles.awardCard}>
    <Text style={styles.awardTitle}>{title}</Text>
    <View style={styles.winnerInfo}>
      <Text style={styles.winnerName}>{winner.playerName}</Text>
      <Text style={styles.winnerTeam}>{winner.teamCity.toUpperCase()}</Text>
    </View>
    {showValue && (
      <View style={styles.valueBadge}>
        <Text style={styles.valueText}>{winner.value}{suffix}</Text>
      </View>
    )}
  </View>
);

const AwardsScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  const awards = save.awards;

  if (!awards) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Awards will be announced at the end of the regular season.</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={onBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEASON AWARDS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.majorAwards}>
          <AwardCard title="MOST VALUABLE PLAYER" winner={awards.mvp} showValue={false} />
          <AwardCard title="DEFENSIVE PLAYER OF THE YEAR" winner={awards.dpoy} showValue={false} />
          <AwardCard title="ROOKIE OF THE YEAR" winner={awards.roty} showValue={false} />
          <AwardCard title="SIXTH MAN OF THE YEAR" winner={awards.sixMan} showValue={false} />
        </View>

        <Text style={styles.sectionLabel}>STATISTICAL LEADERS</Text>
        
        <View style={styles.statAwardsGrid}>
           <AwardCard title="POINTS LEADER" winner={awards.ptsLeader} suffix=" PPG" />
           <AwardCard title="REBOUNDS LEADER" winner={awards.rebLeader} suffix=" RPG" />
           <AwardCard title="ASSISTS LEADER" winner={awards.astLeader} suffix=" APG" />
           <AwardCard title="STEALS LEADER" winner={awards.stlLeader} suffix=" SPG" />
           <AwardCard title="BLOCKS LEADER" winner={awards.blkLeader} suffix=" BPG" />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerBack: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerBackText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  
  scrollContent: { padding: 20 },
  majorAwards: { gap: 15, marginBottom: 30 },
  sectionLabel: { color: '#555', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
  
  statAwardsGrid: { gap: 15 },

  awardCard: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  awardTitle: { color: '#C41E3A', fontSize: 10, fontWeight: '900', letterSpacing: 1, position: 'absolute', top: 10, left: 20 },
  winnerInfo: { marginTop: 10 },
  winnerName: { color: '#FFF', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  winnerTeam: { color: '#666', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  
  valueBadge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  valueText: { color: '#FFF', fontSize: 14, fontWeight: '900' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#555', textAlign: 'center', fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 30 },
  backButton: { backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  backButtonText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});

export default AwardsScreen;
