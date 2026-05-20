import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { getLeagueLeadersData, getTeamLeadersData } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface LeagueLeadersScreenProps {
  save: GameSave;
  onBack: () => void;
}

// Since this app uses conditional rendering for screen navigation,
// mounting acts as the focus event. We use a custom useFocusEffect hook
// to run the fetch/calculation logic whenever the screen comes into focus (mounts)
// or when the synchronized save state updates.
const useFocusEffect = (effect: () => void, dependencies: any[]) => {
  useEffect(() => {
    effect();
  }, dependencies);
};

const LeagueLeadersScreen = ({ save, onBack }: LeagueLeadersScreenProps) => {
  const { playClickSound } = useSound();
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'AWARDS' | 'TEAMS'>('PLAYERS');

  const [leadersData, setLeadersData] = useState(() =>
    getLeagueLeadersData(save.standings, save.seasonCount)
  );
  const [teamLeadersData, setTeamLeadersData] = useState(() =>
    getTeamLeadersData(save.standings)
  );

  useFocusEffect(() => {
    setLeadersData(getLeagueLeadersData(save.standings, save.seasonCount));
    setTeamLeadersData(getTeamLeadersData(save.standings));
  }, [save.standings, save.seasonCount]);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const StatBlock = ({ title, data, statKey }: { title: string; data: any[]; statKey: string }) => (
    <View style={globalStyles.llStatBlockWrapper}>
      <Text style={globalStyles.llSectionHeader}>{title}</Text>
      <View style={globalStyles.llBlockContainer}>
        {data.map((item, index) => {
          const logo = TEAM_LOGOS[item.teamCity];
          return (
            <View
              key={index}
              style={[
                globalStyles.llRow,
                index === 2 && globalStyles.llRowLast,
                index % 2 === 0 ? globalStyles.llRowEven : globalStyles.llRowOdd,
              ]}
            >
              <Text style={globalStyles.llRankText}>#{index + 1}</Text>
              {logo && <Image source={logo} style={globalStyles.llLogo} />}
              <Text style={globalStyles.llNameText} numberOfLines={1}>
                {item.player.lastName}
              </Text>
              <Text style={globalStyles.llStatVal}>{item.avgs[statKey]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const TeamStatBlock = ({ title, data }: { title: string; data: any[] }) => (
    <View style={globalStyles.llStatBlockWrapper}>
      <Text style={globalStyles.llSectionHeader}>{title}</Text>
      <View style={globalStyles.llBlockContainer}>
        {data.map((item, index) => {
          const logo = TEAM_LOGOS[item.city];
          return (
            <View
              key={index}
              style={[
                globalStyles.llRow,
                index === 2 && globalStyles.llRowLast,
                index % 2 === 0 ? globalStyles.llRowEven : globalStyles.llRowOdd,
              ]}
            >
              <Text style={globalStyles.llRankText}>#{index + 1}</Text>
              {logo && <Image source={logo} style={globalStyles.llLogo} />}
              <Text style={globalStyles.llNameText} numberOfLines={1}>
                {item.city}
              </Text>
              <Text style={globalStyles.llStatVal}>{item.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const AwardBlock = ({ title, data }: { title: string; data: any[] }) => (
    <View style={globalStyles.llAwardBlockWrapper}>
      <Text style={globalStyles.llSectionHeader}>{title}</Text>
      {data.length === 0 ? (
        <View style={globalStyles.llEmptyContainer}>
          <Text style={globalStyles.llEmptyText}>
            Award active starting Season 2
          </Text>
        </View>
      ) : (
        <View style={globalStyles.llBlockContainer}>
          {data.map((item, index) => {
            const logo = TEAM_LOGOS[item.teamCity];
            return (
              <View
                key={index}
                style={[
                  globalStyles.llAwardRow,
                  index === 2 && globalStyles.llRowLast,
                  index % 2 === 0 ? globalStyles.llRowEven : globalStyles.llRowOdd,
                ]}
              >
                <View style={globalStyles.flexRowAlignCenter}>
                  <Text style={globalStyles.llRankText}>#{index + 1}</Text>
                  {logo && <Image source={logo} style={globalStyles.llLogo} />}
                  <Text style={globalStyles.llAwardNameText} numberOfLines={1}>
                    {item.player.lastName}
                  </Text>
                  <Text style={globalStyles.llAwardWinsText}>
                    {item.teamWins} WINS
                  </Text>
                </View>
                <Text style={globalStyles.llAwardSubtext}>
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
          <Text style={globalStyles.llTitle}>LEAGUE LEADERS</Text>
        </View>
        <View style={globalStyles.headerSpacer} />
      </View>

      <View style={globalStyles.llTabBar}>
        <TouchableOpacity
          style={[globalStyles.stTab, activeTab === 'PLAYERS' && globalStyles.stActiveTab]}
          onPress={() => handlePress(() => setActiveTab('PLAYERS'))}
        >
          <Text style={[globalStyles.stTabText, activeTab === 'PLAYERS' && globalStyles.stActiveTabText]}>
            PLAYERS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.stTab, activeTab === 'AWARDS' && globalStyles.stActiveTab]}
          onPress={() => handlePress(() => setActiveTab('AWARDS'))}
        >
          <Text style={[globalStyles.stTabText, activeTab === 'AWARDS' && globalStyles.stActiveTabText]}>
            AWARDS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.stTab, activeTab === 'TEAMS' && globalStyles.stActiveTab]}
          onPress={() => handlePress(() => setActiveTab('TEAMS'))}
        >
          <Text style={[globalStyles.stTabText, activeTab === 'TEAMS' && globalStyles.stActiveTabText]}>
            TEAMS
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={globalStyles.llScrollContent}>
        {activeTab === 'PLAYERS' && (
          <>
            <StatBlock title="POINTS PER GAME" data={leadersData.stats.ppg} statKey="pts" />
            <StatBlock title="REBOUNDS PER GAME" data={leadersData.stats.rpg} statKey="reb" />
            <StatBlock title="ASSISTS PER GAME" data={leadersData.stats.apg} statKey="ast" />
            <StatBlock title="STEALS PER GAME" data={leadersData.stats.spg} statKey="stl" />
            <StatBlock title="BLOCKS PER GAME" data={leadersData.stats.bpg} statKey="blk" />
            <StatBlock title="TURNOVERS PER GAME" data={leadersData.stats.topg} statKey="tov" />
          </>
        )}
        {activeTab === 'AWARDS' && (
          <>
            <AwardBlock title="MVP RACE" data={leadersData.awards.mvp} />
            <AwardBlock title="DPOY RACE" data={leadersData.awards.dpoy} />
            <AwardBlock title="SIXTH MAN RACE" data={leadersData.awards.smoy} />
            <AwardBlock title="ROOKIE OF THE YEAR" data={leadersData.awards.roty} />
          </>
        )}
        {activeTab === 'TEAMS' && (
          <>
            <TeamStatBlock title="POINTS PER GAME" data={teamLeadersData.ppg} />
            <TeamStatBlock title="REBOUNDS PER GAME" data={teamLeadersData.rpg} />
            <TeamStatBlock title="ASSISTS PER GAME" data={teamLeadersData.apg} />
            <TeamStatBlock title="STEALS PER GAME" data={teamLeadersData.spg} />
            <TeamStatBlock title="BLOCKS PER GAME" data={teamLeadersData.bpg} />
            <TeamStatBlock title="TURNOVERS PER GAME" data={teamLeadersData.topg} />
            <TeamStatBlock title="FIELD GOAL PERCENTAGE" data={teamLeadersData.fgPct} />
            <TeamStatBlock title="THREE-POINT PERCENTAGE" data={teamLeadersData.threePct} />
            <TeamStatBlock title="WINS" data={teamLeadersData.wins} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

export default LeagueLeadersScreen;
