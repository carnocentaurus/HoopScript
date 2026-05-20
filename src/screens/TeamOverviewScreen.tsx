import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Player, SeasonHistory, TeamStanding } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings, calculateSeasonAverages } from '../utils/leagueEngine';
import { sortRosterByPosition } from '../utils/rosterUtils';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';
import ChampionshipsScreen from './ChampionshipsScreen';

interface TeamOverviewScreenProps {
  city: string;
  roster: Player[];
  history?: SeasonHistory[];
  teamStanding?: TeamStanding;
  onBack: () => void;
}

const TeamOverviewScreen = ({ city, roster, history, teamStanding, onBack }: TeamOverviewScreenProps) => {
  const { playClickSound } = useSound();
  const [showChampionships, setShowChampionships] = useState(false);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  if (showChampionships && history) {
    return <ChampionshipsScreen city={city} history={history} onBack={() => setShowChampionships(false)} />;
  }

  const logo = TEAM_LOGOS[city];

  const starters = sortRosterByPosition(roster.filter(p => p.isStarter));
  const bench = sortRosterByPosition(roster.filter(p => !p.isStarter));
  const ratings = calculateTeamRatings(roster);

  // Calculate Team Season Averages
  const teamTotals = roster.reduce((acc, p) => {
    acc.pts += Number(p.stats.pts || 0);
    acc.reb += Number(p.stats.reb || 0);
    acc.ast += Number(p.stats.ast || 0);
    acc.blk += Number(p.stats.blk || 0);
    acc.stl += Number(p.stats.stl || 0);
    acc.fgm += Number(p.stats.fgm || 0);
    acc.fga += Number(p.stats.fga || 0);
    acc.threePM += Number(p.stats.threePM || 0);
    acc.threePA += Number(p.stats.threePA || 0);
    acc.gp = Math.max(acc.gp, Number(p.stats.gamesPlayed || 0));
    return acc;
  }, { pts: 0, reb: 0, ast: 0, blk: 0, stl: 0, fgm: 0, fga: 0, threePM: 0, threePA: 0, gp: 0 });

  const team = {
    totalSteals: teamTotals.stl,
    totalFGM: teamTotals.fgm,
    totalFGA: teamTotals.fga,
    total3PM: teamTotals.threePM,
    total3PA: teamTotals.threePA,
    gamesPlayed: teamStanding?.gamesPlayed !== undefined ? Number(teamStanding.gamesPlayed) : teamTotals.gp,
    totalPoints: teamStanding?.totalPoints !== undefined ? Number(teamStanding.totalPoints) : teamTotals.pts,
  };

  const teamPPG = team.gamesPlayed > 0 ? (Number(team.totalPoints) / Number(team.gamesPlayed)).toFixed(1) : '0.0';
  const teamSPG = team.gamesPlayed > 0 ? (Number(team.totalSteals) / Number(team.gamesPlayed)).toFixed(1) : '0.0';
  const teamFGpct = team.totalFGA > 0 ? (((Number(team.totalFGM) / Number(team.totalFGA)) * 100).toFixed(1) + '%') : '0.0%';
  const team3Ppct = team.total3PA > 0 ? (((Number(team.total3PM) / Number(team.total3PA)) * 100).toFixed(1) + '%') : '0.0%';

  const teamAvgs = {
    ppg: teamPPG,
    rpg: team.gamesPlayed > 0 ? (teamTotals.reb / team.gamesPlayed).toFixed(1) : '0.0',
    apg: team.gamesPlayed > 0 ? (teamTotals.ast / team.gamesPlayed).toFixed(1) : '0.0',
    bpg: team.gamesPlayed > 0 ? (teamTotals.blk / team.gamesPlayed).toFixed(1) : '0.0',
    spg: teamSPG,
    fgPct: teamFGpct,
    threePct: team3Ppct,
  };

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

        {/* Team Season Averages */}
        <View style={globalStyles.tosTeamSeasonAveragesRow}>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.ppg}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>PPG</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.rpg}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>RPG</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.apg}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>APG</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.bpg}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>BPG</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.spg}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>SPG</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.fgPct}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>FG%</Text>
          </View>
          <View style={globalStyles.tosTeamRatingBox}>
            <Text style={globalStyles.tosTeamAverageVal}>{teamAvgs.threePct}</Text>
            <Text style={globalStyles.tosTeamRatingLabel}>3P%</Text>
          </View>
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