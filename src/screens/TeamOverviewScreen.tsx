import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Player, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings, calculateSeasonAverages } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';
import ChampionshipsScreen from './ChampionshipsScreen';

interface TeamOverviewScreenProps {
  city: string;
  roster: Player[];
  history?: SeasonHistory[];
  onBack: () => void;
}

const TeamOverviewScreen = ({ city, roster, history, onBack }: TeamOverviewScreenProps) => {
  const { playClickSound } = useSound();
  const [showChampionships, setShowChampionships] = useState(false);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  if (showChampionships && history) {
    return <ChampionshipsScreen city={city} history={history} onBack={() => setShowChampionships(false)} />;
  }

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

  const renderPlayerRow = (player: Player) => {
    const avgs = calculateSeasonAverages(player.stats);
    return (
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
            <Text style={globalStyles.tosRatingValSmall}>{player.age}</Text>
            <Text style={globalStyles.tosRatingLabelSmall}>AGE</Text>
          </View>
          <View style={globalStyles.tosRatingItem}>
            <Text style={globalStyles.tosRatingValSmall}>{player.offense}</Text>
            <Text style={globalStyles.tosRatingLabelSmall}>OFF</Text>
          </View>
          <View style={globalStyles.tosRatingItem}>
            <Text style={globalStyles.tosRatingValSmall}>{player.defense}</Text>
            <Text style={globalStyles.tosRatingLabelSmall}>DEF</Text>
          </View>
          <View style={globalStyles.tosRatingItem}>
            <Text style={[globalStyles.tosRatingValSmall, globalStyles.tosOvrVal]}>{player.overall}</Text>
            <Text style={globalStyles.tosRatingLabelSmall}>OVR</Text>
          </View>
        </View>

        {/* Season Averages */}
        <View style={{ marginTop: 10, borderTopWidth: 0.5, borderColor: COLORS.border, paddingTop: 10 }}>
          {/* Row 1: Volume Stats */}
          <View style={[globalStyles.tosRatingsRow, { marginBottom: 10 }]}>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.pts}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>PPG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.reb}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>RPG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.ast}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>APG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.stl}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>SPG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.blk}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>BPG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.tov}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>TOPG</Text>
            </View>
          </View>
          
          {/* Row 2: Efficiency Stats */}
          <View style={globalStyles.tosRatingsRow}>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.min}</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>MPG</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.fgPct}%</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>FG%</Text>
            </View>
            <View style={globalStyles.tosRatingItem}>
              <Text style={globalStyles.tosRatingValSmall}>{avgs.threePct}%</Text>
              <Text style={globalStyles.tosRatingLabelSmall}>3P%</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView style={globalStyles.tosContainer} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.tosHeader}>
          <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.tosBackBtn}>
            <Icon name="chevron-back" size={32} color="#B34726" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePress(() => setShowChampionships(true))}>
            <Icon name="trophy" size={32} color="#B34726" />
          </TouchableOpacity>
        </View>

        <View style={globalStyles.toLogoBanner}>
          {logo && <Image source={logo} style={globalStyles.toLogoBannerImage} />}
          <Text style={globalStyles.tosTitle}>{city.toUpperCase()}</Text>
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