import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameSave, LeagueTeam } from '../types/save';

const StandingsScreen = ({ save, onBack }: { save: GameSave, onBack: () => void }) => {
  const [activeConf, setActiveConf] = useState<'East' | 'West'>(save.conference);

  const filteredTeams = save.standings
    .filter(t => t.conf === activeConf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const renderTeam = ({ item, index }: { item: LeagueTeam, index: number }) => (
    <View style={[styles.teamRow, item.city === save.city && styles.userRow]}>
      <Text style={styles.rankText}>{index + 1}</Text>
      <Text style={styles.cityName}>{item.city}</Text>
      <View style={styles.recordCols}>
        <Text style={styles.recordText}>{item.wins}</Text>
        <Text style={styles.recordText}>{item.losses}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>STANDINGS</Text>
        <View style={{ width: 50 }} /> 
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeConf === 'East' && styles.activeTab]} 
          onPress={() => setActiveConf('East')}
        >
          <Text style={[styles.tabText, activeConf === 'East' && styles.activeTabText]}>EAST</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeConf === 'West' && styles.activeTab]} 
          onPress={() => setActiveConf('West')}
        >
          <Text style={[styles.tabText, activeConf === 'West' && styles.activeTabText]}>WEST</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerRank}>#</Text>
        <Text style={styles.headerTeam}>TEAM</Text>
        <View style={styles.recordColsHeader}>
          <Text style={styles.headerStat}>W</Text>
          <Text style={styles.headerStat}>L</Text>
        </View>
      </View>

      <FlatList
        data={filteredTeams}
        keyExtractor={(item) => item.city}
        renderItem={renderTeam}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backButton: { fontWeight: 'bold', color: '#000' },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderColor: '#000' },
  tabText: { color: '#AAA', fontWeight: 'bold' },
  activeTabText: { color: '#000' },
  tableHeader: { flexDirection: 'row', padding: 15, backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderColor: '#EEE' },
  headerRank: { width: 30, fontSize: 10, color: '#999', fontWeight: 'bold' },
  headerTeam: { flex: 1, fontSize: 10, color: '#999', fontWeight: 'bold' },
  recordColsHeader: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  headerStat: { fontSize: 10, color: '#999', fontWeight: 'bold', width: 25, textAlign: 'center' },
  teamRow: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: '#F0F0F0' },
  userRow: { backgroundColor: '#FFFBEB' },
  rankText: { width: 30, fontWeight: 'bold', color: '#666' },
  cityName: { flex: 1, fontWeight: '600', fontSize: 16 },
  recordCols: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  recordText: { width: 25, textAlign: 'center', fontWeight: 'bold' }
});

export default StandingsScreen;