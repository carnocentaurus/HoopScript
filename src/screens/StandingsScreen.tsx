import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, TeamStanding } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface StandingsProps {
  save: GameSave;
  onBack: () => void;
  onViewTeam: (city: string) => void;
}

const StandingsScreen = ({ save, onBack, onViewTeam }: StandingsProps) => {
  const [activeConf, setActiveConf] = useState<'East' | 'West' | 'League'>(save.conference);
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const filteredTeams = save.standings
    .filter(t => activeConf === 'League' ? true : t.conf === activeConf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const renderTeam = ({ item, index }: { item: TeamStanding, index: number }) => {
    const logo = TEAM_LOGOS[item.city];
    const streakText = item.streak > 0 ? `+${item.streak}` : `${item.streak}`;
    const streakStyle = item.streak > 0 ? globalStyles.stStreakWin : globalStyles.stStreakLoss;

    const games = Number(item.gamesPlayed) || 0;
    const wins = Number(item.wins) || 0;
    const winPct = games > 0 
      ? ((wins / games) * 100).toFixed(1) + '%' 
      : '0.0%';

    const l10Results = item.recentResults || [];
    const l10Wins = l10Results.filter(r => r === 'W').length;
    const l10Losses = l10Results.filter(r => r === 'L').length;
    
    // Safety check: if recentResults is empty but team has played games, fallback to dynamic calculation
    let l10Record = `${l10Wins}-${l10Losses}`;
    if (l10Results.length === 0 && (wins > 0 || Number(item.losses) > 0)) {
      const displayWins = Math.min(wins, 5); // Heuristic fallback
      const displayLosses = Math.min(Number(item.losses), 5);
      l10Record = `${displayWins}-${displayLosses}`;
    }
    
    return (
      <TouchableOpacity 
        style={[globalStyles.stTeamRow, item.city === save.city && globalStyles.stUserRow]}
        onPress={() => handlePress(() => onViewTeam(item.city))}
      >
        <Text style={globalStyles.stRankText} numberOfLines={1}>{index + 1}</Text>
        {logo && <Image source={logo} style={globalStyles.stLogoImage} />}
        <Text style={globalStyles.stCityName} numberOfLines={1} ellipsizeMode="tail">{item.city}</Text>
        <View style={globalStyles.stRecordCols}>
          <Text style={globalStyles.stRecordText} numberOfLines={1}>{item.wins}</Text>
          <Text style={globalStyles.stRecordText} numberOfLines={1}>{item.losses}</Text>
          <Text style={globalStyles.stRecordTextWp} numberOfLines={1}>{winPct}</Text>
          <Text style={globalStyles.stRecordTextL10} numberOfLines={1}>{l10Record}</Text>
          <Text style={[globalStyles.stStreakText, streakStyle]} numberOfLines={1}>{item.streak !== 0 ? streakText : '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={[globalStyles.stHeader, globalStyles.justifyStart]}>
        <TouchableOpacity onPress={() => handlePress(onBack)}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.stTabBar}>
        <TouchableOpacity 
          style={[globalStyles.stTab, activeConf === 'West' && globalStyles.stActiveTab]} 
          onPress={() => handlePress(() => setActiveConf('West'))}
        >
          <Text style={[globalStyles.stTabText, activeConf === 'West' && globalStyles.stActiveTabText]}>WEST</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[globalStyles.stTab, activeConf === 'League' && globalStyles.stActiveTab]} 
          onPress={() => handlePress(() => setActiveConf('League'))}
        >
          <Text style={[globalStyles.stTabText, activeConf === 'League' && globalStyles.stActiveTabText]}>LEAGUE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[globalStyles.stTab, activeConf === 'East' && globalStyles.stActiveTab]} 
          onPress={() => handlePress(() => setActiveConf('East'))}
        >
          <Text style={[globalStyles.stTabText, activeConf === 'East' && globalStyles.stActiveTabText]}>EAST</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        <View>
          <View style={globalStyles.stTableHeader}>
            <Text style={globalStyles.stHeaderRank}>#</Text>
            <Text style={globalStyles.stHeaderTeam}>TEAM</Text>
            <View style={globalStyles.stRecordColsHeader}>
              <Text style={globalStyles.stHeaderStat}>W</Text>
              <Text style={globalStyles.stHeaderStat}>L</Text>
              <Text style={globalStyles.stHeaderStatWp}>W%</Text>
              <Text style={globalStyles.stHeaderStatL10}>L10</Text>
              <Text style={globalStyles.stHeaderStreak}>STRK</Text>
            </View>
          </View>

          <FlatList
            data={filteredTeams}
            keyExtractor={(item) => item.city}
            renderItem={renderTeam}
            contentContainerStyle={globalStyles.pb20}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

export default StandingsScreen;