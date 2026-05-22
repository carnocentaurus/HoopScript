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

const HistoryRecordRow = ({ label, name, teamCity, pos, value }: { label: string, name: string, teamCity: string, pos: string, value: string }) => {
  const logo = TEAM_LOGOS[teamCity];
  return (
    <View style={globalStyles.hiRecordRow}>
      <Text style={globalStyles.hiRecordLabel}>{label}</Text>
      <View style={globalStyles.hiRecordMain}>
        {logo && <Image source={logo} style={globalStyles.hiRecordLogo} />}
        <Text style={globalStyles.hiRecordName} numberOfLines={1}>{name}</Text>
        <Text style={globalStyles.hiRecordPos}>{pos}</Text>
        <Text style={globalStyles.hiRecordValue}>{value}</Text>
      </View>
    </View>
  );
};

const HistoricalSeasonItem = ({ item }: { item: HistoricalSeason }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { playClickSound } = useSound();
  const champLogo = TEAM_LOGOS[item.champion];

  const toggleExpand = () => {
    playClickSound();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={globalStyles.hiHistoryCard}>
      <TouchableOpacity style={globalStyles.hiCardHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={[globalStyles.flexRowAlignCenter, { justifyContent: 'space-between' }]}>
          <View style={globalStyles.flexRowAlignCenter}>
            <Text style={globalStyles.hiYearText}>SEASON {item.seasonNumber} LORE</Text>
            <Icon 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={18} 
              color={COLORS.primary} 
              style={{ marginLeft: 10 }}
            />
          </View>
          <Text style={globalStyles.hiChampStatText}>{item.year}</Text>
        </View>
        
        <View style={globalStyles.hiChampRow}>
          <View style={[globalStyles.flexRowAlignCenter, globalStyles.flex1]}>
            {champLogo && <Image source={champLogo} style={globalStyles.hiLogoImage} />}
            <Text style={globalStyles.hiChampText}>{item.champion.toUpperCase()}</Text>
          </View>
          <View style={globalStyles.hiChampStats}>
            <Text style={globalStyles.hiChampStatText}>{item.championRecord}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={globalStyles.hiExpandedContent}>
          <Text style={globalStyles.hiSectionTitle}>AWARD WINNERS</Text>
          <HistoryRecordRow label="MVP" name={item.awards.mvp.name} teamCity={item.awards.mvp.teamLogo} pos={item.awards.mvp.pos} value={item.awards.mvp.stats} />
          <HistoryRecordRow label="DPOY" name={item.awards.dpoy.name} teamCity={item.awards.dpoy.teamLogo} pos={item.awards.dpoy.pos} value={item.awards.dpoy.stats} />
          <HistoryRecordRow label="6MAN" name={item.awards.smoy.name} teamCity={item.awards.smoy.teamLogo} pos={item.awards.smoy.pos} value={item.awards.smoy.stats} />
          {item.awards.roty && (
            <HistoryRecordRow label="ROTY" name={item.awards.roty.name} teamCity={item.awards.roty.teamLogo} pos={item.awards.roty.pos} value={item.awards.roty.stats} />
          )}

          <Text style={[globalStyles.hiSectionTitle, { marginTop: 20 }]}>STAT LEADERS</Text>
          <HistoryRecordRow label="PPG" name={item.statLeaders.ppg.name} teamCity={item.statLeaders.ppg.teamLogo} pos={item.statLeaders.ppg.pos} value={item.statLeaders.ppg.value} />
          <HistoryRecordRow label="RPG" name={item.statLeaders.rpg.name} teamCity={item.statLeaders.rpg.teamLogo} pos={item.statLeaders.rpg.pos} value={item.statLeaders.rpg.value} />
          <HistoryRecordRow label="APG" name={item.statLeaders.apg.name} teamCity={item.statLeaders.apg.teamLogo} pos={item.statLeaders.apg.pos} value={item.statLeaders.apg.value} />
          <HistoryRecordRow label="SPG" name={item.statLeaders.spg.name} teamCity={item.statLeaders.spg.teamLogo} pos={item.statLeaders.spg.pos} value={item.statLeaders.spg.value} />
          <HistoryRecordRow label="BPG" name={item.statLeaders.bpg.name} teamCity={item.statLeaders.bpg.teamLogo} pos={item.statLeaders.bpg.pos} value={item.statLeaders.bpg.value} />
        </View>
      )}

      <View style={globalStyles.hiUserSummary}>
        <Text style={globalStyles.hiUserLabel}>YOUR RECORD:</Text>
        <Text style={globalStyles.hiUserStat}>{item.userRecord}</Text>
      </View>
    </View>
  );
};

const HistoryScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
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
            <HistoricalSeasonItem key={idx} item={item} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

export default HistoryScreen;
