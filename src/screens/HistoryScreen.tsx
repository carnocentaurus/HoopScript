import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GameSave, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';

const HistoryItem = ({ item }: { item: SeasonHistory }) => (
  <View style={globalStyles.hiHistoryCard}>
    <View style={globalStyles.hiCardHeader}>
      <Text style={globalStyles.hiYearText}>S{item.seasonIndex} - {item.year}</Text>
      <View style={globalStyles.hiChampRow}>
        <Text style={globalStyles.hiChampText}>🏆 {item.champion.toUpperCase()}</Text>
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

const HistoryScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity style={globalStyles.hiHeaderBack} onPress={onBack}>
          <Text style={globalStyles.hiHeaderBackText}>←</Text>
        </TouchableOpacity>
        <Text style={globalStyles.hiHeaderTitle}>CAREER HISTORY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={globalStyles.hiScrollContent}>
        {save.history.length === 0 ? (
          <View style={globalStyles.hiEmptyContainer}>
            <Text style={globalStyles.hiEmptyText}>No finished seasons recorded yet.</Text>
          </View>
        ) : (
          [...save.history].reverse().map((item, idx) => (
            <HistoryItem key={idx} item={item} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

export default HistoryScreen;