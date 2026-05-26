import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, HistoricalSeason } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HistoryRecordRow = ({ 
  label, 
  name, 
  teamCity, 
  pos, 
  value, 
  isAward = false 
}: { 
  label: string, 
  name: string, 
  teamCity: string, 
  pos?: string, 
  value: string,
  isAward?: boolean
}) => {
  const logo = TEAM_LOGOS[teamCity];

  if (isAward) {
    if (name === "N/A") return null;
    return (
      <View style={globalStyles.hiAwardRow}>
        <View style={globalStyles.hiAwardTopLine}>
          {logo && <Image source={logo} style={globalStyles.hiRecordLogoLarge} />}
          <Text style={globalStyles.hiAwardLabel}>{label}</Text>
          <Text style={globalStyles.hiRecordName} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
          {pos ? <Text style={globalStyles.hiRecordPos}>{pos}</Text> : null}
        </View>
        <View style={globalStyles.hiAwardBottomLine}>
          <Text style={globalStyles.hiAwardStats}>Stats: {value}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.hiRecordRow}>
      <Text style={globalStyles.hiRecordLabel}>{label}</Text>
      <View style={globalStyles.hiRecordMain}>
        {logo && <Image source={logo} style={globalStyles.hiRecordLogoLarge} />}
        <Text style={globalStyles.hiRecordName} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
        {pos ? <Text style={globalStyles.hiRecordPos}>{pos}</Text> : null}
        <Text style={globalStyles.hiRecordValue}>{value}</Text>
      </View>
    </View>
  );
};

const HistoricalSeasonItem = ({ item, onViewStandings, onViewBracket }: { item: HistoricalSeason, onViewStandings: (s: number) => void, onViewBracket: (s: number) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { playClickSound } = useSound();
  const champLogo = TEAM_LOGOS[item.champion];

  const toggleExpand = () => {
    playClickSound();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleAction = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <View style={globalStyles.hiHistoryCard}>
      <TouchableOpacity style={globalStyles.hiCardHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={globalStyles.cardHeaderRow}>
          <View style={globalStyles.flexRowAlignCenter}>
            <Text style={globalStyles.hiYearText}>S{item.seasonNumber} - {item.year} 🏆</Text>
            <Icon 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={18} 
              color={COLORS.primary} 
              style={{ marginLeft: 10 }}
            />
          </View>
          
          <View style={globalStyles.iconActionGroup}>
            <TouchableOpacity onPress={() => handleAction(() => onViewStandings(item.seasonNumber))}>
              <Icon name="podium-outline" size={22} color="#E2725B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAction(() => onViewBracket(item.seasonNumber))}>
              <Icon name="git-network-outline" size={22} color="#E2725B" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={globalStyles.hiChampRow}>
          <View style={[globalStyles.flexRowAlignCenter, globalStyles.flex1]}>
            {champLogo && <Image source={champLogo} style={globalStyles.hiLogoImage} />}
            <Text style={globalStyles.hiChampText} numberOfLines={1} ellipsizeMode="tail">
              {item.champion.toUpperCase()}
            </Text>
          </View>
          <View style={globalStyles.hiChampStats}>
            <Text style={globalStyles.hiChampStatText}>{item.championRecord}</Text>
            {item.championRank && <Text style={[globalStyles.hiChampStatText, { fontSize: 8, color: COLORS.textMuted }]}>{item.championRank}</Text>}
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={globalStyles.hiExpandedContent}>
          <Text style={globalStyles.hiSectionTitle}>AWARD WINNERS</Text>
          <HistoryRecordRow label="MVP" name={item.awards.mvp.name} teamCity={item.awards.mvp.teamLogo} pos={item.awards.mvp.pos} value={item.awards.mvp.stats} isAward />
          <HistoryRecordRow label="FMVP" name={item.awards.finalsMvp ? item.awards.finalsMvp.name : "N/A"} teamCity={item.awards.finalsMvp ? item.awards.finalsMvp.teamLogo : "N/A"} pos={item.awards.finalsMvp ? item.awards.finalsMvp.pos : "-"} value={item.awards.finalsMvp ? item.awards.finalsMvp.stats : "-"} isAward />
          <HistoryRecordRow label="DPOY" name={item.awards.dpoy.name} teamCity={item.awards.dpoy.teamLogo} pos={item.awards.dpoy.pos} value={item.awards.dpoy.stats} isAward />
          <HistoryRecordRow label="6MAN" name={item.awards.smoy.name} teamCity={item.awards.smoy.teamLogo} pos={item.awards.smoy.pos} value={item.awards.smoy.stats} isAward />
          {item.awards.roty && (
            <HistoryRecordRow label="ROTY" name={item.awards.roty.name} teamCity={item.awards.roty.teamLogo} pos={item.awards.roty.pos} value={item.awards.roty.stats} isAward />
          )}

          <Text style={[globalStyles.hiSectionTitle, { marginTop: 20 }]}>STAT LEADERS</Text>
          <HistoryRecordRow label="PPG" name={item.statLeaders.ppg.name} teamCity={item.statLeaders.ppg.teamLogo} pos={item.statLeaders.ppg.pos} value={item.statLeaders.ppg.value} />
          <HistoryRecordRow label="RPG" name={item.statLeaders.rpg.name} teamCity={item.statLeaders.rpg.teamLogo} pos={item.statLeaders.rpg.pos} value={item.statLeaders.rpg.value} />
          <HistoryRecordRow label="APG" name={item.statLeaders.apg.name} teamCity={item.statLeaders.apg.teamLogo} pos={item.statLeaders.apg.pos} value={item.statLeaders.apg.value} />
          <HistoryRecordRow label="SPG" name={item.statLeaders.spg.name} teamCity={item.statLeaders.spg.teamLogo} pos={item.statLeaders.spg.pos} value={item.statLeaders.spg.value} />
          <HistoryRecordRow label="BPG" name={item.statLeaders.bpg.name} teamCity={item.statLeaders.bpg.teamLogo} pos={item.statLeaders.bpg.pos} value={item.statLeaders.bpg.value} />

          {item.teamLeaders && (
            <>
              <Text style={[globalStyles.hiSectionTitle, { marginTop: 20 }]}>TEAM LEADERS</Text>
              <HistoryRecordRow label="PPG" name={item.teamLeaders.ppg.name} teamCity={item.teamLeaders.ppg.teamLogo} value={item.teamLeaders.ppg.value} />
              <HistoryRecordRow label="RPG" name={item.teamLeaders.rpg.name} teamCity={item.teamLeaders.rpg.teamLogo} value={item.teamLeaders.rpg.value} />
              <HistoryRecordRow label="APG" name={item.teamLeaders.apg.name} teamCity={item.teamLeaders.apg.teamLogo} value={item.teamLeaders.apg.value} />
              <HistoryRecordRow label="SPG" name={item.teamLeaders.spg.name} teamCity={item.teamLeaders.spg.teamLogo} value={item.teamLeaders.spg.value} />
              <HistoryRecordRow label="BPG" name={item.teamLeaders.bpg.name} teamCity={item.teamLeaders.bpg.teamLogo} value={item.teamLeaders.bpg.value} />
              <HistoryRecordRow label="TOPG" name={item.teamLeaders.topg.name} teamCity={item.teamLeaders.topg.teamLogo} value={item.teamLeaders.topg.value} />
              <HistoryRecordRow label="FG%" name={item.teamLeaders.fgPct.name} teamCity={item.teamLeaders.fgPct.teamLogo} value={item.teamLeaders.fgPct.value} />
              <HistoryRecordRow label="3P%" name={item.teamLeaders.threePPct.name} teamCity={item.teamLeaders.threePPct.teamLogo} value={item.teamLeaders.threePPct.value} />
            </>
          )}
        </View>
      )}

      <View style={globalStyles.hiUserSummary}>
        <Text style={globalStyles.hiUserLabel}>YOUR RECORD:</Text>
        <Text style={globalStyles.hiUserStat}>
          {item.userRecord} {item.userRank ? `- ${item.userRank}` : (item.userTeamSeed ? `(#${item.userTeamSeed})` : '')}
        </Text>
      </View>
    </View>
  );
};

const HistoryScreen = ({ save, onBack, onViewStandings, onViewBracket }: { save: GameSave, onBack: () => void, onViewStandings: (s?: number) => void, onViewBracket: (s?: number) => void }) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const displayHistory = save.leagueHistory || [];

  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.hiHeaderBack}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>LEAGUE HISTORY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={globalStyles.hiScrollContent} showsVerticalScrollIndicator={false}>
        {displayHistory.length === 0 ? (
          <View style={globalStyles.hiEmptyContainer}>
            <Image source={require('../../assets/images/trophy.png')} style={{ width: 60, height: 60, opacity: 0.2, marginBottom: 20, resizeMode: 'contain' }} />
            <Text style={globalStyles.hiEmptyText}>The history books are currently empty.</Text>
            <Text style={[globalStyles.hiEmptyText, { fontSize: 12, marginTop: 5 }]}>Complete your first season to archive records.</Text>
          </View>
        ) : (
          [...displayHistory].reverse().map((item, idx) => (
            <HistoricalSeasonItem 
              key={idx} 
              item={item} 
              onViewStandings={onViewStandings} 
              onViewBracket={onViewBracket} 
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

export default HistoryScreen;
