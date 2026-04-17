import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Player, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

interface TeamOverviewScreenProps {
  city: string;
  roster: Player[];
  history?: SeasonHistory[];
  onBack: () => void;
}

const TeamOverviewScreen = ({ city, roster, history, onBack }: TeamOverviewScreenProps) => {
  const starters = roster.filter(p => p.isStarter);
  const bench = roster.filter(p => !p.isStarter);
  const ratings = calculateTeamRatings(roster);

  const championships = history?.filter(h => h.champion === city).length || 0;

  const renderPlayerRow = (player: Player) => (
    <View style={globalStyles.tosPlayerCard} key={player.id}>
      <View style={globalStyles.tosPlayerHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        <TouchableOpacity onPress={onBack} style={globalStyles.tosBackBtn}>
          <Icon name="chevron-back" size={30} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={globalStyles.tosTitle}>{city.toUpperCase()}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={globalStyles.tosContainer} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.tosTrophySection}>
          <Text style={globalStyles.tosTrophyIcon}>🏆</Text>
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

        <View style={{ height: 20 }} />
        <Text style={globalStyles.tosSectionHeader}>BENCH</Text>
        {bench.map(p => renderPlayerRow(p))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
};

export default TeamOverviewScreen;