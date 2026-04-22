import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, SeasonHistory, TeamStanding, SeriesMatchup } from '../types/save';
import Screen from '../components/Screen';
import StandingsScreen from './StandingsScreen';
import FullPlayoffBracketScreen from './FullPlayoffBracketScreen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

const HistoryItem = ({ 
  item, 
  onViewStandings, 
  onViewBracket 
}: { 
  item: SeasonHistory, 
  onViewStandings: () => void, 
  onViewBracket: () => void 
}) => {
  const logo = TEAM_LOGOS[item.champion];
  const { playClickSound } = useSound();
  
  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <View style={globalStyles.hiHistoryCard}>
      <View style={globalStyles.hiCardHeader}>
        <View style={[globalStyles.flexRowAlignCenter, { justifyContent: 'space-between' }]}>
          <Text style={globalStyles.hiYearText}>S{item.seasonIndex} - {item.year}</Text>
          <View style={globalStyles.flexRow}>
            <TouchableOpacity 
              style={{ marginLeft: 15 }} 
              onPress={() => handlePress(onViewStandings)}
              disabled={!item.standings}
            >
              <Icon 
                name="podium-outline" 
                size={24} 
                color={item.standings ? COLORS.primary : COLORS.grayLighter} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ marginLeft: 15 }} 
              onPress={() => handlePress(onViewBracket)}
              disabled={!item.playoffBracket}
            >
              <Icon 
                name="git-network-outline" 
                size={24} 
                color={item.playoffBracket ? COLORS.primary : COLORS.grayLighter} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[globalStyles.hiChampRow, { marginTop: 10 }]}>
          <View style={[globalStyles.flexRowAlignCenter, globalStyles.flex1]}>
            <Icon name="trophy" size={20} color="#FFD700" style={globalStyles.mr8} />
            {logo && <Image source={logo} style={globalStyles.hiLogoImage} />}
            <Text style={globalStyles.hiChampText}>{item.champion.toUpperCase()}</Text>
          </View>
          <View style={globalStyles.hiChampStats}>
            <Text style={globalStyles.hiChampStatText}>{item.championRecord}</Text>
            <Text style={globalStyles.hiChampStatText}>{item.championRank}</Text>
          </View>
        </View>
      </View>

      <View style={globalStyles.hiUserSummary}>
        <Text style={globalStyles.hiUserLabel}>YOUR TEAM:</Text>
        <Text style={globalStyles.hiUserStat}>{item.userRecord}</Text>
        <Text style={globalStyles.hiUserStat}>{item.userRank}</Text>
      </View>
    </View>
  );
};

const HistoryScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  const [selectedStandings, setSelectedStandings] = useState<TeamStanding[] | null>(null);
  const [selectedBracket, setSelectedBracket] = useState<SeriesMatchup[] | null>(null);
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>LEAGUE HISTORY</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={globalStyles.hiScrollContent}>
        {save.history.length === 0 ? (
          <View style={globalStyles.hiEmptyContainer}>
            <Text style={globalStyles.hiEmptyText}>No finished seasons recorded yet.</Text>
          </View>
        ) : (
          [...save.history].reverse().map((item, idx) => (
            <HistoryItem 
              key={idx} 
              item={item} 
              onViewStandings={() => item.standings && setSelectedStandings(item.standings)}
              onViewBracket={() => item.playoffBracket && setSelectedBracket(item.playoffBracket)}
            />
          ))
        )}
      </ScrollView>

      {/* Historical Standings Modal */}
      <Modal visible={!!selectedStandings} animationType="slide">
        {selectedStandings && (
          <StandingsScreen 
            save={{ ...save, standings: selectedStandings }} 
            onBack={() => setSelectedStandings(null)} 
            onViewTeam={() => {}} // Disable team overview in historical view for now
          />
        )}
      </Modal>

      {/* Historical Bracket Modal */}
      <Modal visible={!!selectedBracket} animationType="slide">
        {selectedBracket && (
          <FullPlayoffBracketScreen 
            save={{ ...save, playoffBracket: selectedBracket }} 
            onBack={() => setSelectedBracket(null)} 
          />
        )}
      </Modal>
    </Screen>
  );
};

export default HistoryScreen;
