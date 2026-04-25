import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
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
        <Text style={globalStyles.hiHeaderTitle}>{city.toUpperCase()}</Text>
        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.tosContainer} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.vSpacer20} />

        {teamChampionships.length > 0 ? (
          <View style={globalStyles.flexRowWrapBetween}>
            {teamChampionships.map((h, index) => (
              <View key={index} style={[globalStyles.homeMatchupCard, { width: '48%', marginBottom: 15, paddingVertical: 20 }]}>
                <Image source={require('../../assets/images/trophy.png')} style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 }} />
                <Text style={globalStyles.homeMatchupCity}>{h.year}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[globalStyles.centerContent, { marginTop: 80 }]}>
            <Icon name="trophy" size={150} color={COLORS.grayLighter} />
            <Text style={[globalStyles.hiEmptyText, { marginTop: 20 }]}>No championships yet.</Text>
          </View>
        )}

        <View style={globalStyles.vSpacer40} />
      </ScrollView>
    </Screen>
  );
};

export default ChampionshipsScreen;
