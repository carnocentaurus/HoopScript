import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

// Added onStartNewSeason to the props interface
interface PlayoffProps {
  save: GameSave;
  onSimDay: () => void;
  onBack: () => void;
  onStartNewSeason: () => void;
  onViewFullBracket: () => void;
}

const PlayoffBracketScreen = ({ save, onSimDay, onBack, onStartNewSeason, onViewFullBracket }: PlayoffProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

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
        {matchups.map((series) => {
          const highLogo = TEAM_LOGOS[series.highSeed];
          const lowLogo = TEAM_LOGOS[series.lowSeed];
          
          return (
            <View key={series.id} style={globalStyles.pbSeriesCard}>
              <View style={globalStyles.pbTeamRow}>
                <View style={globalStyles.pbTeamInfo}>
                  <Text style={globalStyles.pbRankLabel}>{getRank(series.highSeed)}</Text>
                  {highLogo && <Image source={highLogo} style={globalStyles.pbLogoImage} />}
                  <Text style={[globalStyles.pbTeamName, series.highSeedWins === 4 && globalStyles.textTerracotta]}>
                    {series.highSeed}
                  </Text>
                </View>
                <Text style={[globalStyles.pbScore, series.highSeedWins === 4 && globalStyles.textTerracotta]}>
                  {series.highSeedWins}
                </Text>
              </View>

              <View style={globalStyles.pbTeamRow}>
                <View style={globalStyles.pbTeamInfo}>
                  <Text style={globalStyles.pbRankLabel}>{getRank(series.lowSeed)}</Text>
                  {lowLogo && <Image source={lowLogo} style={globalStyles.pbLogoImage} />}
                  <Text style={[globalStyles.pbTeamName, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                    {series.lowSeed}
                  </Text>
                </View>
                <Text style={[globalStyles.pbScore, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                  {series.lowSeedWins}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const isSeriesCompleted = save.playoffs && (save.playoffs.myWins === 4 || save.playoffs.oppWins === 4);

  return (
    <Screen>
      <View style={globalStyles.pbHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)}>
          <Icon name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={globalStyles.pbTitle}>{isFinalsOver ? "FINALS COMPLETE" : `ROUND ${currentRound}`}</Text>
        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.pbContent}>
        {renderConferenceSection('East')}
        {renderConferenceSection('West')}
        {renderConferenceSection('Finals')}
        
        {isFinalsOver && (
          <View style={globalStyles.pbChampContainer}>
            <Icon name="trophy" size={120} color="#FFD700" style={globalStyles.mb30} />
            <Text style={globalStyles.pbChampText}>
              CHAMPIONS: {(roundMatchups[0].highSeedWins === 4 ? roundMatchups[0].highSeed : roundMatchups[0].lowSeed).toUpperCase()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Button Logic: Show "Full Bracket" and "Start New Season" if Finals are over, otherwise "Simulate Day" */}
      {isFinalsOver ? (
        <>
          <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.bgTerracotta, globalStyles.mb10]} onPress={() => handlePress(onViewFullBracket)}>
            <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>FULL BRACKET</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.pbNextSeasonBtn, globalStyles.bgTerracotta]} onPress={() => handlePress(onStartNewSeason)}>
            <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>START NEW SEASON</Text>
          </TouchableOpacity>
        </>
      ) : (
        (save.playoffs?.isEliminated || isSeriesCompleted) && (
          <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.bgTerracotta]} onPress={() => handlePress(onSimDay)}>
            <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>SIMULATE DAY</Text>
          </TouchableOpacity>
        )
      )}
    </Screen>
  );
};

export default PlayoffBracketScreen;