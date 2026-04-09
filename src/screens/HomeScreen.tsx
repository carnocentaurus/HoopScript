import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameSave } from '../types/save';

const TeamMatchupCard = ({ team }: { team: any }) => (
  <View style={[styles.matchupCard, team.isUser && styles.userCard]}>
    {team.isUser && (
      <View style={styles.userBadge}>
        <Text style={styles.userBadgeText}>YOUR TEAM</Text>
      </View>
    )}
    <Text style={[styles.matchupLogo, team.isUser ? styles.userLogoText : styles.oppLogoText]}>
      {team.city.charAt(0)}
    </Text>
    <Text style={styles.matchupCity}>{team.city}</Text>
    <Text style={styles.matchupSub}>{team.rank} | {team.record}</Text>
    
    {/* Clean indicator for Home/Away status */}
    <View style={[styles.venueBadge, team.isHome ? styles.homeBadge : styles.awayBadge]}>
      <Text style={styles.venueText}>{team.isHome ? "HOME" : "AWAY"}</Text>
    </View>
  </View>
);

const HomeScreen = ({ 
  save, 
  userTeam, 
  opponent, 
  onQuickSim, 
  onViewStandings 
}: { 
  save: GameSave, 
  userTeam: any, 
  opponent: any, 
  onQuickSim: () => void,
  onViewStandings: () => void 
}) => {

  // Determine order: Away Team on Left, Home Team on Right
  const LeftTeam = opponent.isHome ? userTeam : opponent;
  const RightTeam = opponent.isHome ? opponent : userTeam;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.standingsBtn} onPress={onViewStandings}>
          <Text style={styles.standingsBtnText}>LEAGUE STANDINGS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.sectionLabelCenter}>UPCOMING MATCHUP</Text>
        
        <View style={styles.matchupWrapper}>
          {/* Away Team */}
          <TeamMatchupCard team={LeftTeam} />
          
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>AT</Text>
          </View>

          {/* Home Team */}
          <TeamMatchupCard team={RightTeam} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>SEASON PROGRESS</Text>
            <Text style={styles.statsText}>{save.gamesPlayed} / {save.totalGames}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(save.gamesPlayed / save.totalGames) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.simButton} onPress={onQuickSim}>
        <Text style={styles.simButtonText}>SIMULATE GAME</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  topNav: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 10 },
  standingsBtn: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#FFF', borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  standingsBtnText: { fontSize: 10, fontWeight: '800', color: '#66788A', letterSpacing: 1 },
  
  mainContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  sectionLabelCenter: { color: '#A0AEC0', fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginBottom: 25 },
  
  matchupWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchupCard: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    paddingVertical: 30, 
    paddingHorizontal: 10,
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent' // Default border is invisible
  },
  userCard: { 
    borderColor: '#4A90E2', // Blue border highlights your team specifically
  },
  userBadge: { position: 'absolute', top: -10, backgroundColor: '#4A90E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  userBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  
  matchupLogo: { fontSize: 42, fontWeight: '900', marginBottom: 12 },
  userLogoText: { color: '#2D3748' },
  oppLogoText: { color: '#CBD5E0' },
  matchupCity: { fontSize: 16, fontWeight: '800', color: '#2D3748', textTransform: 'uppercase' },
  matchupSub: { color: '#718096', fontSize: 11, marginTop: 4, fontWeight: '600' },
  
  venueBadge: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  homeBadge: { backgroundColor: '#EBF4FF' },
  awayBadge: { backgroundColor: '#F7FAFC' },
  venueText: { fontSize: 10, fontWeight: '800', color: '#4A90E2', letterSpacing: 0.5 },

  vsContainer: { width: 40, alignItems: 'center' },
  vsText: { color: '#CBD5E0', fontWeight: '900', fontSize: 16 },

  progressSection: { marginTop: 60, paddingHorizontal: 20 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' },
  progressLabel: { color: '#718096', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4A90E2' },
  statsText: { color: '#2D3748', fontSize: 14, fontWeight: '800' },

  simButton: { backgroundColor: '#2D3748', margin: 20, padding: 20, borderRadius: 16, alignItems: 'center', position: 'absolute', bottom: 40, left: 0, right: 0, elevation: 8 },
  simButtonText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});

export default HomeScreen;