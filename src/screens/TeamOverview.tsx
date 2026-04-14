import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';

interface SimplePlayer {
  id?: string;
  lastName: string;
  position?: string;
  offense: number;
  defense: number;
  overall: number;
}

interface TeamOverviewProps {
  city: string;
  roster: SimplePlayer[];
  onBack: () => void;
  onConfirm?: () => void;
}

const TeamOverview = ({ city, roster, onBack, onConfirm }: TeamOverviewProps) => {
  // Map simple roster to what calculateTeamRatings expects if needed, 
  // though calculateTeamRatings currently expects Player[] from types/save.
  // We'll cast for now as the fields we need are there.
  const ratings = calculateTeamRatings(roster as any);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{city} Roster</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.teamStatsRow}>
          <View style={styles.statBox}><Text style={styles.statVal}>{ratings.offense}</Text><Text style={styles.statLabel}>OFF</Text></View>
          <View style={styles.statBox}><Text style={styles.statVal}>{ratings.defense}</Text><Text style={styles.statLabel}>DEF</Text></View>
          <View style={styles.statBox}><Text style={styles.statVal}>{ratings.overall}</Text><Text style={styles.statLabel}>OVR</Text></View>
      </View>

      <FlatList
        data={roster.filter(p => p.isStarter)}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <Text style={styles.playerPos}>{item.position || '?'}</Text>
            <Text style={styles.playerName}>{item.lastName}</Text>
            <Text style={styles.playerOvr}>
              {item.overall}
            </Text>
          </View>
        )}
      />

      {onConfirm && (
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmBtnText}>CHOOSE THIS TEAM</Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  backBtn: {
    padding: 10,
    width: 60,
  },
  backBtnText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  teamStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  playerCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  playerPos: {
    width: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
  },
  playerOvr: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmBtn: {
    backgroundColor: '#4A90E2',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TeamOverview;