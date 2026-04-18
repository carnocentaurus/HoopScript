import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, SeasonHistory } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

const HistoryItem = ({ item }: { item: SeasonHistory }) => (
  <View style={globalStyles.hiHistoryCard}>
    <View style={globalStyles.hiCardHeader}>
      <Text style={globalStyles.hiYearText}>S{item.seasonIndex} - {item.year}</Text>
      <View style={globalStyles.hiChampRow}>
        <View style={[globalStyles.flexRowAlignCenter, globalStyles.flex1]}>
          <Icon name="trophy" size={20} color="#FFD700" style={{ marginRight: 8 }} />
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

const HistoryScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  return (
    <Screen>
      <View style={globalStyles.hiHeader}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
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