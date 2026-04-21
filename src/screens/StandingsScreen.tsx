import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, TeamStanding } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';

interface StandingsProps {
  save: GameSave;
  onBack: () => void;
  onViewTeam: (city: string) => void;
}

const StandingsScreen = ({ save, onBack, onViewTeam }: StandingsProps) => {
  const [activeConf, setActiveConf] = useState<'East' | 'West'>(save.conference);

  const filteredTeams = save.standings
    .filter(t => t.conf === activeConf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const renderTeam = ({ item, index }: { item: TeamStanding, index: number }) => {
    const logo = TEAM_LOGOS[item.city];
    
    return (
      <TouchableOpacity 
        style={[globalStyles.stTeamRow, item.city === save.city && globalStyles.stUserRow]}
        onPress={() => onViewTeam(item.city)}
      >
        <Text style={globalStyles.stRankText}>{index + 1}</Text>
        {logo && <Image source={logo} style={globalStyles.stLogoImage} />}
        <Text style={globalStyles.stCityName}>{item.city}</Text>
        <View style={globalStyles.stRecordCols}>
          <Text style={globalStyles.stRecordText}>{item.wins}</Text>
          <Text style={globalStyles.stRecordText}>{item.losses}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={[globalStyles.stHeader, globalStyles.justifyStart]}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.stTabBar}>
        <TouchableOpacity 
          style={[globalStyles.stTab, activeConf === 'West' && globalStyles.stActiveTab]} 
          onPress={() => setActiveConf('West')}
        >
          <Text style={[globalStyles.stTabText, activeConf === 'West' && globalStyles.stActiveTabText]}>WEST</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[globalStyles.stTab, activeConf === 'East' && globalStyles.stActiveTab]} 
          onPress={() => setActiveConf('East')}
        >
          <Text style={[globalStyles.stTabText, activeConf === 'East' && globalStyles.stActiveTabText]}>EAST</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.stTableHeader}>
        <Text style={globalStyles.stHeaderRank}>#</Text>
        <Text style={globalStyles.stHeaderTeam}>TEAM</Text>
        <View style={globalStyles.stRecordColsHeader}>
          <Text style={globalStyles.stHeaderStat}>W</Text>
          <Text style={globalStyles.stHeaderStat}>L</Text>
        </View>
      </View>

      <FlatList
        data={filteredTeams}
        keyExtractor={(item) => item.city}
        renderItem={renderTeam}
        contentContainerStyle={globalStyles.pb20}
      />
    </Screen>
  );
};

export default StandingsScreen;