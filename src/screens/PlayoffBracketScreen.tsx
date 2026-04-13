import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';

// Added onStartNewSeason to the props interface
interface PlayoffProps {
  save: GameSave;
  onSimDay: () => void;
  onBack: () => void;
  onStartNewSeason: () => void;
  onViewAwards: () => void;
}

const PlayoffBracketScreen = ({ save, onSimDay, onBack, onStartNewSeason, onViewAwards }: PlayoffProps) => {
  const currentRound = save.playoffs?.round || 1;
  const roundMatchups = save.playoffBracket?.filter(s => s.round === currentRound) || [];
  
  // Check if the Finals (Round 4) are completed
  const isFinalsOver = currentRound === 4 && roundMatchups.length > 0 && roundMatchups[0].isCompleted;

  const getRank = (city: string) => {
    const team = save.standings.find(t => t.city === city);
    if (!team) return "";
    
    const confTeams = save.standings
      .filter(t => t.conf === team.conf)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
      
    const index = confTeams.findIndex(t => t.city === city);
    return (index + 1).toString();
  };

  const renderConferenceSection = (conf: 'East' | 'West' | 'Finals') => {
    const matchups = roundMatchups.filter(m => m.conference === conf);
    if (matchups.length === 0) return null;

    return (
      <View key={conf} style={styles.conferenceSection}>
        <Text style={styles.conferenceHeader}>
          {conf === 'Finals' ? 'LEAGUE FINALS' : `${conf.toUpperCase()}ERN CONFERENCE`}
        </Text>
        {matchups.map((series) => (
          <View key={series.id} style={styles.seriesCard}>
            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                <Text style={styles.rankLabel}>{getRank(series.highSeed)}</Text>
                <Text style={[styles.teamName, series.highSeedWins === 4 && styles.winner]}>
                  {series.highSeed}
                </Text>
              </View>
              <Text style={styles.score}>{series.highSeedWins}</Text>
            </View>

            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                <Text style={styles.rankLabel}>{getRank(series.lowSeed)}</Text>
                <Text style={[styles.teamName, series.lowSeedWins === 4 && styles.winner]}>
                  {series.lowSeed}
                </Text>
              </View>
              <Text style={styles.score}>{series.lowSeedWins}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const isSeriesCompleted = save.playoffs && (save.playoffs.myWins === 4 || save.playoffs.oppWins === 4);

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← HOME</Text></TouchableOpacity>
        <Text style={styles.title}>{isFinalsOver ? "FINALS COMPLETE" : `ROUND ${currentRound}`}</Text>
        <TouchableOpacity onPress={onViewAwards}><Text style={styles.awardsText}>AWARDS</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderConferenceSection('East')}
        {renderConferenceSection('West')}
        {renderConferenceSection('Finals')}
        
        {isFinalsOver && (
          <View style={styles.champContainer}>
            <Text style={styles.champText}>
              🏆 {roundMatchups[0].highSeedWins === 4 ? roundMatchups[0].highSeed : roundMatchups[0].lowSeed} CHAMPIONS
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Button Logic: Show "Start New Season" if Finals are over, otherwise "Simulate Day" */}
      {isFinalsOver ? (
        <TouchableOpacity style={[styles.simDayBtn, styles.nextSeasonBtn]} onPress={onStartNewSeason}>
          <Text style={styles.simDayBtnText}>START NEW SEASON</Text>
        </TouchableOpacity>
      ) : (
        (save.playoffs?.isEliminated || isSeriesCompleted) && (
          <TouchableOpacity style={styles.simDayBtn} onPress={onSimDay}>
            <Text style={styles.simDayBtnText}>SIMULATE DAY</Text>
          </TouchableOpacity>
        )
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backText: { fontWeight: 'bold', color: '#4A90E2' },
  awardsText: { fontWeight: 'bold', color: '#C41E3A' },
  title: { fontSize: 18, fontWeight: '900', color: '#2D3748' },
  content: { padding: 16 },
  conferenceSection: { marginBottom: 20 },
  conferenceHeader: { fontSize: 12, fontWeight: '900', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4 },
  seriesCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, alignItems: 'center' },
  teamInfo: { flexDirection: 'row', alignItems: 'center' },
  rankLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: 'bold', width: 22, textAlign: 'left' },
  teamName: { fontSize: 16, fontWeight: '700', color: '#4A5568' },
  winner: { color: '#4A90E2' },
  score: { fontSize: 16, fontWeight: '900', color: '#2D3748' },
  simDayBtn: { backgroundColor: '#2D3748', margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  nextSeasonBtn: { backgroundColor: '#48BB78' }, // Green for the new start
  simDayBtnText: { color: '#FFF', fontWeight: 'bold' },
  champContainer: { alignItems: 'center', marginTop: 20, padding: 20 },
  champText: { fontSize: 20, fontWeight: '900', color: '#2D3748' }
});

export default PlayoffBracketScreen;