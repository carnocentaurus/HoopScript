import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { getLeagueLeadersData } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS, FONTS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface LeagueLeadersScreenProps {
  save: GameSave;
  onBack: () => void;
}

const LeagueLeadersScreen = ({ save, onBack }: LeagueLeadersScreenProps) => {
  const { playClickSound } = useSound();
  const [activeTab, setActiveTab] = useState<'STATS' | 'AWARDS'>('STATS');

  const leadersData = useMemo(() => {
    return getLeagueLeadersData(save.standings, save.seasonCount);
  }, [save.standings, save.seasonCount]);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const StatBlock = ({ title, data, statKey }: { title: string, data: any[], statKey: string }) => (
    <View style={{ marginBottom: 25 }}>
      <Text style={[globalStyles.tosSectionHeader, { marginLeft: 0, color: COLORS.primary }]}>{title}</Text>
      <View style={{ backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
        {data.map((item, index) => {
          const logo = TEAM_LOGOS[item.teamCity];
          return (
            <View key={index} style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 12, 
              borderBottomWidth: index === 2 ? 0 : 1, 
              borderColor: COLORS.border,
              backgroundColor: index % 2 === 0 ? COLORS.card : COLORS.grayLight
            }}>
              <Text style={{ width: 30, fontFamily: FONTS.primary, color: COLORS.textSub }}>#{index + 1}</Text>
              {logo && <Image source={logo} style={{ width: 36, height: 36, marginRight: 12, resizeMode: 'contain' }} />}
              <Text style={{ flex: 1, fontFamily: FONTS.secondary, color: COLORS.white, fontSize: 14 }} numberOfLines={1}>
                {item.player.lastName}
              </Text>
              <Text style={{ fontFamily: FONTS.primary, color: COLORS.primary, fontSize: 14 }}>
                {item.avgs[statKey]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const AwardBlock = ({ title, data, type }: { title: string, data: any[], type: string }) => (
    <View style={{ marginBottom: 30 }}>
      <Text style={[globalStyles.tosSectionHeader, { marginLeft: 0, color: COLORS.primary }]}>{title}</Text>
      {data.length === 0 ? (
        <View style={{ padding: 20, backgroundColor: COLORS.card, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ color: COLORS.textMuted, fontFamily: FONTS.secondary, fontSize: 12 }}>
            Award active starting Season 2
          </Text>
        </View>
      ) : (
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
          {data.map((item, index) => {
            const logo = TEAM_LOGOS[item.teamCity];
            return (
              <View key={index} style={{ 
                padding: 15, 
                borderBottomWidth: index === 2 ? 0 : 1, 
                borderColor: COLORS.border,
                backgroundColor: index % 2 === 0 ? COLORS.card : COLORS.grayLight
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ width: 30, fontFamily: FONTS.primary, color: COLORS.textSub }}>#{index + 1}</Text>
                  {logo && <Image source={logo} style={{ width: 36, height: 36, marginRight: 12, resizeMode: 'contain' }} />}
                  <Text style={{ flex: 1, fontFamily: FONTS.secondary, color: COLORS.white, fontSize: 16 }} numberOfLines={1}>
                    {item.player.lastName}
                  </Text>
                  <Text style={{ fontFamily: FONTS.primary, color: COLORS.primary, fontSize: 12 }}>
                    {item.teamWins} WINS
                  </Text>
                </View>
                <Text style={{ marginLeft: 64, marginTop: 4, color: COLORS.textMuted, fontFamily: FONTS.secondary, fontSize: 11 }}>
                  {item.avgs.pts} PPG / {item.avgs.reb} RPG / {item.avgs.ast} APG
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <Screen>
      <View style={[globalStyles.homeSeasonHeader, globalStyles.flexRowAlignCenter]}>
        <TouchableOpacity 
          style={globalStyles.qsBackBtn} 
          onPress={() => handlePress(onBack)}
        >
          <Icon name="chevron-back" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={globalStyles.flex1}>
          <Text style={[globalStyles.tosTitle, { marginBottom: 0, textAlign: 'center' }]}>LEAGUE LEADERS</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={[globalStyles.stTabBar, { marginTop: 10 }]}>
        <TouchableOpacity 
          style={[globalStyles.stTab, activeTab === 'STATS' && globalStyles.stActiveTab]} 
          onPress={() => handlePress(() => setActiveTab('STATS'))}
        >
          <Text style={[globalStyles.stTabText, activeTab === 'STATS' && globalStyles.stActiveTabText]}>STATS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[globalStyles.stTab, activeTab === 'AWARDS' && globalStyles.stActiveTab]} 
          onPress={() => handlePress(() => setActiveTab('AWARDS'))}
        >
          <Text style={[globalStyles.stTabText, activeTab === 'AWARDS' && globalStyles.stActiveTabText]}>AWARDS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'STATS' ? (
          <>
            <StatBlock title="POINTS PER GAME" data={leadersData.stats.ppg} statKey="pts" />
            <StatBlock title="REBOUNDS PER GAME" data={leadersData.stats.rpg} statKey="reb" />
            <StatBlock title="ASSISTS PER GAME" data={leadersData.stats.apg} statKey="ast" />
            <StatBlock title="STEALS PER GAME" data={leadersData.stats.spg} statKey="stl" />
            <StatBlock title="BLOCKS PER GAME" data={leadersData.stats.bpg} statKey="blk" />
            <StatBlock title="TURNOVERS PER GAME" data={leadersData.stats.topg} statKey="tov" />
          </>
        ) : (
          <>
            <AwardBlock title="MVP RACE" data={leadersData.awards.mvp} type="MVP" />
            <AwardBlock title="DPOY RACE" data={leadersData.awards.dpoy} type="DPOY" />
            <AwardBlock title="SIXTH MAN RACE" data={leadersData.awards.smoy} type="SMOY" />
            <AwardBlock title="ROOKIE OF THE YEAR" data={leadersData.awards.roty} type="ROTY" />
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

export default LeagueLeadersScreen;
