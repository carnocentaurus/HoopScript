import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Player, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface TeamOverviewScreenProps {
  city: string;
  roster: Player[];
  history?: SeasonHistory[];
  onBack: () => void;
}

const TeamOverviewScreen = ({ city, roster, history, onBack }: TeamOverviewScreenProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const POSITION_ORDER: Record<string, number> = { "PG": 1, "SG": 2, "SF": 3, "PF": 4, "C": 5 };
  const logo = TEAM_LOGOS[city];

  const sortPlayersByPosition = (players: Player[]) => {
    return [...players].sort((a, b) => {
      const orderA = POSITION_ORDER[a.position] || 99;
      const orderB = POSITION_ORDER[b.position] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.overall - a.overall; // Secondary sort by overall
    });
  };

  const starters = sortPlayersByPosition(roster.filter(p => p.isStarter));
  const bench = [...roster.filter(p => !p.isStarter)].sort((a, b) => b.overall - a.overall);
  const ratings = calculateTeamRatings(roster);

  const championships = history?.filter(h => h.champion === city).length || 0;

  const renderPlayerRow = (player: Player) => (
    <View style={globalStyles.tosPlayerCard} key={player.id}>
      <View style={globalStyles.tosPlayerHeader}>
        <View style={globalStyles.flexRowAlignCenter}>
          <Text style={globalStyles.tosPlayerMain}>{player.lastName} <Text style={globalStyles.tosPlayerNum}>#{player.number}</Text></Text>
          {player.isRookie && (
            <View style={globalStyles.tosRookieBadge}>
              <Text style={globalStyles.tosRookieBadgeText}>ROOKIE</Text>
            </View>
          )}
        </View>
        <Text style={globalStyles.tosPlayerPos}>{player.position}</Text>
      </View>
      
      <View style={globalStyles.tosRatingsRow}>
        <View style={globalStyles.tosRatingItem}>
          <Text style={globalStyles.tosRatingVal}>{player.age}</Text>
          <Text style={globalStyles.tosRatingLabel}>AGE</Text>
        </View>
        <View style={globalStyles.tosRatingItem}>
          <Text style={globalStyles.tosRatingVal}>{player.offense}</Text>
          <Text style={globalStyles.tosRatingLabel}>OFF</Text>
        </View>
        <View style={globalStyles.tosRatingItem}>
          <Text style={globalStyles.tosRatingVal}>{player.defense}</Text>
          <Text style={globalStyles.tosRatingLabel}>DEF</Text>
        </View>
        <View style={globalStyles.tosRatingItem}>
          <Text style={[globalStyles.tosRatingVal, globalStyles.tosOvrVal]}>{player.overall}</Text>
          <Text style={globalStyles.tosRatingLabel}>OVR</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={globalStyles.tosHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.tosBackBtn}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
        <View style={globalStyles.flexRowAlignCenter}>
          {logo && <Image source={logo} style={[globalStyles.mr8, { width: 30, height: 30, resizeMode: 'contain' }]} />}
          <Text style={globalStyles.tosTitle}>{city.toUpperCase()}</Text>
        </View>
        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.tosContainer} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.tosTrophySection}>
          <Icon name="trophy" size={32} color="#FFD700" />
          <Text style={globalStyles.tosTrophyCount}>{championships}</Text>
          <Text style={globalStyles.tosTrophyLabel}>CHAMPIONSHIPS</Text>
        </View>

        <View style={globalStyles.tosTeamRatingsRow}>
          <View style={globalStyles.tosTeamRatingBox}><Text style={globalStyles.tosTeamRatingVal}>{ratings.offense}</Text><Text style={globalStyles.tosTeamRatingLabel}>OFF</Text></View>
          <View style={globalStyles.tosTeamRatingBox}><Text style={globalStyles.tosTeamRatingVal}>{ratings.defense}</Text><Text style={globalStyles.tosTeamRatingLabel}>DEF</Text></View>
          <View style={globalStyles.tosTeamRatingBox}><Text style={[globalStyles.tosTeamRatingVal, globalStyles.tosTeamOvrVal]}>{ratings.overall}</Text><Text style={globalStyles.tosTeamRatingLabel}>OVR</Text></View>
        </View>

        <Text style={globalStyles.tosSectionHeader}>STARTERS</Text>
        {starters.map(p => renderPlayerRow(p))}

        <View style={globalStyles.vSpacer20} />
        <Text style={globalStyles.tosSectionHeader}>BENCH</Text>
        {bench.map(p => renderPlayerRow(p))}
        
        <View style={globalStyles.vSpacer40} />
      </ScrollView>
    </Screen>
  );
};

export default TeamOverviewScreen;