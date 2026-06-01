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
    playClickSound();
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity style={globalStyles.hiHeaderBack} onPress={handleBack}>
          <Ionicons name="chevron-back" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>Credits</Text>
        <View style={globalStyles.w40} />
      </View>

      <ScrollView contentContainerStyle={globalStyles.p20}>
        <View style={[globalStyles.hiHistoryCard, globalStyles.p20, globalStyles.mb30]}>
          <Text style={[globalStyles.hiYearText, globalStyles.mb10]}>Sound Effects</Text>
          <Text style={globalStyles.hiChampText}>Click Tick 2</Text>
          <Text style={[globalStyles.hiUserStat, globalStyles.mt5, globalStyles.fontSecondary]}>by malle99</Text>
          <TouchableOpacity onPress={() => openUrl('https://freesound.org/s/496760/')}>
            <Text style={[globalStyles.textTerracotta, globalStyles.mt10, globalStyles.textUnderline, globalStyles.fontSecondary]}>Source: Freesound.org</Text>
          </TouchableOpacity>
          <Text style={[globalStyles.hiUserLabel, globalStyles.mt10]}>License: Creative Commons 0</Text>
        </View>

        <View style={[globalStyles.hiHistoryCard, globalStyles.p20]}>
          <Text style={[globalStyles.hiYearText, globalStyles.mb10]}>Background Music</Text>
          <Text style={globalStyles.hiChampText}>Basketball - NBA Basketball Music</Text>
          <Text style={[globalStyles.hiUserStat, globalStyles.mt5, globalStyles.fontSecondary]}>by Andrii Poradovskyi</Text>
          <TouchableOpacity onPress={() => openUrl('https://pixabay.com/users/poradovskyi-52868186/')}>
            <Text style={[globalStyles.textTerracotta, globalStyles.mt10, globalStyles.textUnderline, globalStyles.fontSecondary]}>Artist: Pixabay Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openUrl('https://pixabay.com/music/beats-basketball-nba-basketball-music-426800/')}>
            <Text style={[globalStyles.textTerracotta, globalStyles.mt5, globalStyles.textUnderline, globalStyles.fontSecondary]}>Source: Pixabay Music</Text>
          </TouchableOpacity>
          <Text style={[globalStyles.hiUserLabel, globalStyles.mt10]}>License: Pixabay License</Text>
        </View>
        
        <View style={[globalStyles.mt20, globalStyles.alignCenter]}>
          <Text style={[globalStyles.hiUserLabel, globalStyles.textCenter, globalStyles.opacity60]}>
            All rights reserved to their respective owners.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default CreditsScreen;