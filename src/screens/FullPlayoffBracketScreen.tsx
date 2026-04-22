import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, SeriesMatchup } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { useSound } from '../hooks/useSound';

interface FullBracketProps {
  save: GameSave;
  onBack: () => void;
}

const FullPlayoffBracketScreen = ({ save, onBack }: FullBracketProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const getRank = (city: string) => {
    const team = save.standings.find(t => t.city === city);
    if (!team) return "";
    
    const confTeams = save.standings
      .filter(t => t.conf === team.conf)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
      
    const index = confTeams.findIndex(t => t.city === city);
    return (index + 1).toString();
  };

  const renderRound = (round: number) => {
    const roundMatchups = save.playoffBracket?.filter(s => s.round === round) || [];
    if (roundMatchups.length === 0) return null;

    const getRoundTitle = (r: number) => {
      if (r === 1) return "ROUND 1";
      if (r === 2) return "CONF SEMIFINALS";
      if (r === 3) return "CONF FINALS";
      if (r === 4) return "LEAGUE FINALS";
      return `ROUND ${r}`;
    };

    return (
      <View key={round} style={globalStyles.fpbRoundContainer}>
        <Text style={globalStyles.fpbRoundTitle}>{getRoundTitle(round)}</Text>
        {roundMatchups.map((series) => (
          <View key={series.id} style={globalStyles.pbSeriesCard}>
            <View style={globalStyles.pbTeamRow}>
              <View style={globalStyles.pbTeamInfo}>
                <Text style={globalStyles.pbRankLabel}>{getRank(series.highSeed)}</Text>
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
                <Text style={[globalStyles.pbTeamName, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                  {series.lowSeed}
                </Text>
              </View>
              <Text style={[globalStyles.pbScore, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                {series.lowSeedWins}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Screen>
      <View style={globalStyles.pbHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)}>
          <Icon name="chevron-back" size={28} color="#B34726" />
        </TouchableOpacity>
        <Text style={globalStyles.pbTitle}>FULL BRACKET</Text>

        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.pbContent}>
        {[1, 2, 3, 4].map(r => renderRound(r))}
        <View style={globalStyles.vSpacer40} />
      </ScrollView>
    </Screen>
  );
};

export default FullPlayoffBracketScreen;
