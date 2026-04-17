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
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 20 }}>
        <Icon name="chevron-back" size={32} color={COLORS.primary} />
      </TouchableOpacity>
      <ScrollView 
        style={globalStyles.appScrollList} 
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {years.map(year => (
            <TouchableOpacity 
              key={year} 
              style={[
                globalStyles.appYearButton, 
                { 
                  backgroundColor: COLORS.primary, 
                  borderLeftWidth: 0, 
                  width: '48%', 
                  marginBottom: 10 
                }
              ]}
              onPress={() => onSelectYear(year)}
            >
              <Text style={[globalStyles.appYearText, { color: COLORS.black }]}>{year}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default YearSelectionScreen;
