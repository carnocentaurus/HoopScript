import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

interface YearSelectionScreenProps {
  onSelectYear: (year: number) => void;
  onBack: () => void;
}

const YearSelectionScreen = ({ onSelectYear, onBack }: YearSelectionScreenProps) => {
  const years = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 1950 + i).reverse();
  
  return (
    <View style={globalStyles.blackContainer}>
      <TouchableOpacity onPress={onBack} style={globalStyles.mb20}>
        <Icon name="chevron-back" size={32} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={globalStyles.homeSectionLabelCenter}>START YEAR</Text>
      <ScrollView 
        style={globalStyles.appScrollList} 
        contentContainerStyle={globalStyles.appScrollListContent}
      >
        <View style={globalStyles.flexRowWrapBetween}>
          {years.map(year => (
            <TouchableOpacity 
              key={year} 
              style={[
                globalStyles.appYearButton, 
                globalStyles.appYearButtonPrimary
              ]}
              onPress={() => onSelectYear(year)}
            >
              <Text style={[globalStyles.appYearText, globalStyles.appYearTextBlack]}>{year}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default YearSelectionScreen;
