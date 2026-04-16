import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';

// Added onStartNewSeason to the props interface
interface PlayoffProps {
  save: GameSave;
  onSimDay: () => void;
  onBack: () => void;
  onStartNewSeason: () => void;
}

const PlayoffBracketScreen = ({ save, onSimDay, onBack, onStartNewSeason }: PlayoffProps) => {
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
      <View key={conf} style={globalStyles.pbConferenceSection}>
        <Text style={globalStyles.pbConferenceHeader}>
          {conf === 'Finals' ? 'LEAGUE FINALS' : `${conf.toUpperCase()}ERN CONFERENCE`}
        </Text>
        {matchups.map((series) => (
          <View key={series.id} style={globalStyles.pbSeriesCard}>
            <View style={globalStyles.pbTeamRow}>
              <View style={globalStyles.pbTeamInfo}>
                <Text style={globalStyles.pbRankLabel}>{getRank(series.highSeed)}</Text>
                <Text style={[globalStyles.pbTeamName, series.highSeedWins === 4 && globalStyles.pbWinner]}>
                  {series.highSeed}
                </Text>
              </View>
              <Text style={globalStyles.pbScore}>{series.highSeedWins}</Text>
            </View>

            <View style={globalStyles.pbTeamRow}>
              <View style={globalStyles.pbTeamInfo}>
                <Text style={globalStyles.pbRankLabel}>{getRank(series.lowSeed)}</Text>
                <Text style={[globalStyles.pbTeamName, series.lowSeedWins === 4 && globalStyles.pbWinner]}>
                  {series.lowSeed}
                </Text>
              </View>
              <Text style={globalStyles.pbScore}>{series.lowSeedWins}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const isSeriesCompleted = save.playoffs && (save.playoffs.myWins === 4 || save.playoffs.oppWins === 4);

  return (
    <Screen>
      <View style={globalStyles.pbHeader}>
        <TouchableOpacity onPress={onBack}><Text style={globalStyles.pbBackText}>← HOME</Text></TouchableOpacity>
        <Text style={globalStyles.pbTitle}>{isFinalsOver ? "FINALS COMPLETE" : `ROUND ${currentRound}`}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={globalStyles.pbContent}>
        {renderConferenceSection('East')}
        {renderConferenceSection('West')}
        {renderConferenceSection('Finals')}
        
        {isFinalsOver && (
          <View style={globalStyles.pbChampContainer}>
            <Text style={globalStyles.pbChampText}>
              🏆 {roundMatchups[0].highSeedWins === 4 ? roundMatchups[0].highSeed : roundMatchups[0].lowSeed} CHAMPIONS
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Button Logic: Show "Start New Season" if Finals are over, otherwise "Simulate Day" */}
      {isFinalsOver ? (
        <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.pbNextSeasonBtn]} onPress={onStartNewSeason}>
          <Text style={globalStyles.pbSimDayBtnText}>START NEW SEASON</Text>
        </TouchableOpacity>
      ) : (
        (save.playoffs?.isEliminated || isSeriesCompleted) && (
          <TouchableOpacity style={globalStyles.pbSimDayBtn} onPress={onSimDay}>
            <Text style={globalStyles.pbSimDayBtnText}>SIMULATE DAY</Text>
          </TouchableOpacity>
        )
      )}
    </Screen>
  );
};

export default PlayoffBracketScreen;