import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { useSound } from '../hooks/useSound';

interface ChampionshipsScreenProps {
  city: string;
  history: SeasonHistory[];
  onBack: () => void;
}

const ChampionshipsScreen = ({ city, history, onBack }: ChampionshipsScreenProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const teamChampionships = history.filter(h => h.champion === city).sort((a, b) => b.year - a.year);

  return (
    <Screen>
      <View style={globalStyles.tosHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.tosBackBtn}>
          <Icon name="chevron-back" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>CHAMPIONSHIPS</Text>
        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.tosContainer} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.centerContent}>
          <Icon name="trophy" size={100} color="#FFD700" style={{ marginVertical: 30 }} />
          <Text style={[globalStyles.tosTitle, { fontSize: 24, color: COLORS.white }]}>{city.toUpperCase()}</Text>
          <Text style={globalStyles.tosTrophyCount}>{teamChampionships.length} TITLES</Text>
        </View>

        <View style={globalStyles.vSpacer40} />

        {teamChampionships.length > 0 ? (
          teamChampionships.map((h, index) => (
            <View key={index} style={[globalStyles.tosPlayerCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={globalStyles.tosPlayerMain}>{h.year} CHAMPIONS</Text>
                <Text style={globalStyles.tosPlayerPos}>{h.championRecord}</Text>
              </View>
              <Icon name="star" size={24} color="#FFD700" />
            </View>
          ))
        ) : (
          <Text style={[globalStyles.hiEmptyText, { marginTop: 40 }]}>No championships yet.</Text>
        )}
      </ScrollView>
    </Screen>
  );
};

export default ChampionshipsScreen;
