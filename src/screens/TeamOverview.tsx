import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface SimplePlayer {
  id?: string;
  lastName: string;
  position?: string;
  offense: number;
  defense: number;
  overall: number;
  isStarter: boolean;
}

interface TeamOverviewProps {
  city: string;
  roster: SimplePlayer[];
  onBack: () => void;
  onConfirm?: () => void;
}

const TeamOverview = ({ city, roster, onBack, onConfirm }: TeamOverviewProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const POSITION_ORDER: Record<string, number> = { "PG": 1, "SG": 2, "SF": 3, "PF": 4, "C": 5 };
// ... rest of component logic ...
  const sortPlayersByPosition = (players: SimplePlayer[]) => {
    return [...players].sort((a, b) => {
      const orderA = POSITION_ORDER[a.position || ''] || 99;
      const orderB = POSITION_ORDER[b.position || ''] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.overall - a.overall;
    });
  };

  // Map simple roster to what calculateTeamRatings expects if needed, 
  // though calculateTeamRatings currently expects Player[] from types/save.
  // We'll cast for now as the fields we need are there.
  const ratings = calculateTeamRatings(roster as any);

  const starters = sortPlayersByPosition(roster.filter(p => p.isStarter));
  const bench = [...roster.filter(p => !p.isStarter)].sort((a, b) => b.overall - a.overall);
  const logo = TEAM_LOGOS[city];

  return (
    <Screen>
      <View style={globalStyles.toHeaderRow}>
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.toBackBtn}>
          <Icon name="chevron-back" size={30} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={globalStyles.flexRowAlignCenter}>
          {logo && <Image source={logo} style={globalStyles.tosLogoImage} />}
          <Text style={globalStyles.toHeaderText}>{city}</Text>
        </View>
        <View style={globalStyles.headerSpacer} />
      </View>

      <View style={globalStyles.toTeamStatsRow}>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.offense}</Text><Text style={globalStyles.toStatLabel}>OFF</Text></View>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.defense}</Text><Text style={globalStyles.toStatLabel}>DEF</Text></View>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.overall}</Text><Text style={globalStyles.toStatLabel}>OVR</Text></View>
      </View>

      <FlatList
        data={[
          { type: 'header' as const, title: 'STARTERS' },
          ...starters.map(p => ({ ...p, type: 'player' as const })),
          { type: 'header' as const, title: 'BENCH' },
          ...bench.map(p => ({ ...p, type: 'player' as const }))
        ]}
        keyExtractor={(item, index) => (item.type === 'header' ? `header-${item.title}` : (item.id || index.toString()))}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={globalStyles.toSectionHeader}>
                <Text style={globalStyles.toSectionHeaderText}>{item.title}</Text>
              </View>
            );
          }
          const p = item as SimplePlayer;
          return (
            <View style={globalStyles.toPlayerCard}>
              <Text style={globalStyles.toPlayerPos}>{p.position || '?'}</Text>
              <Text style={globalStyles.toPlayerName}>{p.lastName}</Text>
              <Text style={globalStyles.toPlayerOvr}>
                {p.overall}
              </Text>
            </View>
          );
        }}
      />

      {onConfirm && (
        <TouchableOpacity style={globalStyles.toConfirmBtn} onPress={() => handlePress(onConfirm)}>
          <Text style={[globalStyles.toConfirmBtnTextBlack, globalStyles.fw900]}>SELECT TEAM</Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
};

export default TeamOverview;