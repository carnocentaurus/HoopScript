import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { useSound } from '../hooks/useSound';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../styles/theme';

interface CreditsScreenProps {
  onBack: () => void;
}

const CreditsScreen = ({ onBack }: CreditsScreenProps) => {
  const { playClickSound } = useSound();

  const handleBack = () => {
    playClickSound();
    onBack();
  };

  const openUrl = (url: string) => {
    handlePress(() => {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    });
  };

  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity style={globalStyles.hiHeaderBack} onPress={handleBack}>
          <Ionicons name="chevron-back" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>Credits</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[globalStyles.hiHistoryCard, { marginBottom: 30 }]}>
          <Text style={[globalStyles.hiYearText, { marginBottom: 10 }]}>Sound Effects</Text>
          <Text style={globalStyles.hiChampText}>Click Tick 2</Text>
          <Text style={[globalStyles.hiUserStat, { marginTop: 5, fontFamily: FONTS.secondary }]}>by malle99</Text>
          <TouchableOpacity onPress={() => openUrl('https://freesound.org/s/496760/')}>
            <Text style={[globalStyles.textTerracotta, { marginTop: 10, textDecorationLine: 'underline', fontFamily: FONTS.secondary }]}>Source: Freesound.org</Text>
          </TouchableOpacity>
          <Text style={[globalStyles.hiUserLabel, { marginTop: 10 }]}>License: Creative Commons 0</Text>
        </View>

        <View style={globalStyles.hiHistoryCard}>
          <Text style={[globalStyles.hiYearText, { marginBottom: 10 }]}>Background Music</Text>
          <Text style={globalStyles.hiChampText}>Basketball - NBA Basketball Music</Text>
          <Text style={[globalStyles.hiUserStat, { marginTop: 5, fontFamily: FONTS.secondary }]}>by Andrii Poradovskyi</Text>
          <TouchableOpacity onPress={() => openUrl('https://pixabay.com/users/poradovskyi-52868186/')}>
            <Text style={[globalStyles.textTerracotta, { marginTop: 10, textDecorationLine: 'underline', fontFamily: FONTS.secondary }]}>Artist: Pixabay Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openUrl('https://pixabay.com/music/beats-basketball-nba-basketball-music-426800/')}>
            <Text style={[globalStyles.textTerracotta, { marginTop: 5, textDecorationLine: 'underline', fontFamily: FONTS.secondary }]}>Source: Pixabay Music</Text>
          </TouchableOpacity>
          <Text style={[globalStyles.hiUserLabel, { marginTop: 10 }]}>License: Pixabay License</Text>
        </View>
        
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={[globalStyles.hiUserLabel, { textAlign: 'center', opacity: 0.6 }]}>
            All rights reserved to their respective owners.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default CreditsScreen;