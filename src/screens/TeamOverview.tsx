import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

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
  // Map simple roster to what calculateTeamRatings expects if needed, 
  // though calculateTeamRatings currently expects Player[] from types/save.
  // We'll cast for now as the fields we need are there.
  const ratings = calculateTeamRatings(roster as any);

  return (
    <Screen>
      <View style={globalStyles.toHeaderRow}>
        <TouchableOpacity onPress={onBack} style={globalStyles.toBackBtn}>
          <Icon name="chevron-back" size={30} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={globalStyles.toHeaderText}>{city} Roster</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={globalStyles.toTeamStatsRow}>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.offense}</Text><Text style={globalStyles.toStatLabel}>OFF</Text></View>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.defense}</Text><Text style={globalStyles.toStatLabel}>DEF</Text></View>
          <View style={globalStyles.toStatBox}><Text style={globalStyles.toStatVal}>{ratings.overall}</Text><Text style={globalStyles.toStatLabel}>OVR</Text></View>
      </View>

      <FlatList
        data={[
          { type: 'header' as const, title: 'STARTERS' },
          ...roster.filter(p => p.isStarter).map(p => ({ ...p, type: 'player' as const })),
          { type: 'header' as const, title: 'BENCH' },
          ...roster.filter(p => !p.isStarter).map(p => ({ ...p, type: 'player' as const }))
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
        <TouchableOpacity style={globalStyles.toConfirmBtn} onPress={onConfirm}>
          <Text style={globalStyles.toConfirmBtnText}>CHOOSE THIS TEAM</Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
};

export default TeamOverview;