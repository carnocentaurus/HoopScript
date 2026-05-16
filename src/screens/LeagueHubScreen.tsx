import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { useSound } from '../hooks/useSound';

const HubCard = ({ 
  label, 
  icon, 
  onPress, 
  playClickSound 
}: { 
  label: string, 
  icon: string, 
  onPress: () => void, 
  playClickSound: () => void 
}) => (
  <TouchableOpacity 
    style={globalStyles.hubCard} 
    onPress={() => { playClickSound(); onPress(); }}
  >
    <Icon name={icon as any} size={48} color={COLORS.primary} style={globalStyles.hubCardIcon} />
    <Text style={globalStyles.hubCardText}>{label}</Text>
  </TouchableOpacity>
);

const LeagueHubScreen = ({ 
  onBack,
  onViewHistory,
  onViewTeam,
  onViewStandings,
  onViewLeaders
}: { 
  onBack: () => void,
  onViewHistory: () => void,
  onViewTeam: () => void,
  onViewStandings: () => void,
  onViewLeaders: () => void
}) => {
  const { playClickSound } = useSound();

  const handleBack = () => {
    playClickSound();
    onBack();
  };

  return (
    <Screen>
      <View style={[globalStyles.homeSeasonHeader, globalStyles.flexRowAlignCenter]}>
        <TouchableOpacity 
          style={globalStyles.qsBackBtn} 
          onPress={handleBack}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="chevron-back" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={globalStyles.flex1} />
        
        <Text style={globalStyles.tosTitle}>LEAGUE HUB</Text>
        
        <View style={globalStyles.flex1} />
        
        {/* Spacer to perfectly center the title by matching the back button's width */}
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={globalStyles.hubGrid}>
        <HubCard 
          label="History" 
          icon="time-outline" 
          onPress={onViewHistory} 
          playClickSound={playClickSound} 
        />
        <HubCard 
          label="Team" 
          icon="people-outline" 
          onPress={onViewTeam} 
          playClickSound={playClickSound} 
        />
        <HubCard 
          label="Standings" 
          icon="podium-outline" 
          onPress={onViewStandings} 
          playClickSound={playClickSound} 
        />
        <HubCard 
          label="Leaders" 
          icon="trophy-outline" 
          onPress={onViewLeaders} 
          playClickSound={playClickSound} 
        />
      </ScrollView>
    </Screen>
  );
};

export default LeagueHubScreen;
