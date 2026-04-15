import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Player, DraftState, DraftPick } from '../types/save';
import Screen from '../components/Screen';

interface DraftScreenProps {
  userCity: string;
  draftState: DraftState;
  onPick: (player: Player) => void;
  onComplete: () => void;
  onViewTeam: () => void;
}

const DraftScreen = ({ userCity, draftState, onPick, onComplete, onViewTeam }: DraftScreenProps) => {
  const { currentPickIndex, picks, pool, isCompleted } = draftState;
  const currentPick = picks[currentPickIndex];
  const isUserTurn = currentPick?.teamCity === userCity;

  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      onComplete();
      return;
    }

    if (!isUserTurn && currentPickIndex < picks.length && !simulating) {
      // Auto-pick for AI with a slight delay
      const timer = setTimeout(() => {
        const bestPlayer = pool.sort((a, b) => b.overall - a.overall)[0];
        onPick(bestPlayer);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPickIndex, isUserTurn, isCompleted, simulating]);

  const handleSimToUserPick = () => {
    setSimulating(true);
    let nextIndex = currentPickIndex;
    let currentPool = [...pool];

    const interval = setInterval(() => {
      if (nextIndex >= picks.length || picks[nextIndex].teamCity === userCity) {
        clearInterval(interval);
        setSimulating(false);
        return;
      }

      const bestPlayer = currentPool.sort((a, b) => b.overall - a.overall)[0];
      onPick(bestPlayer);
      currentPool = currentPool.filter(p => p.id !== bestPlayer.id);
      nextIndex++;
    }, 100);
  };

  const renderProspect = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.lastName}</Text>
        <Text style={styles.playerSub}>{item.position} | AGE {item.age}</Text>
      </View>
      <View style={styles.ratingBox}>
        <Text style={styles.ratingVal}>{item.overall}</Text>
        <Text style={styles.ratingLabel}>OVR</Text>
      </View>
      {isUserTurn && !simulating && (
        <TouchableOpacity 
          style={styles.pickBtn} 
          onPress={() => {
            Alert.alert("Draft Player", `Are you sure you want to draft ${item.lastName}?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Draft", onPress: () => onPick(item) }
            ]);
          }}
        >
          <Text style={styles.pickBtnText}>PICK</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>ROOKIE DRAFT</Text>
          <TouchableOpacity style={styles.teamViewBtn} onPress={onViewTeam}>
            <Text style={styles.teamViewBtnText}>TEAM OVERVIEW</Text>
          </TouchableOpacity>
        </View>

        {currentPick && (
          <View style={styles.onClockCard}>
            <Text style={styles.onClockLabel}>ON THE CLOCK</Text>
            <Text style={styles.onClockTeam}>{currentPick.teamCity.toUpperCase()}</Text>
            <Text style={styles.pickNumber}>Round {currentPick.round} | Pick {currentPick.overall}</Text>
          </View>
        )}
      </View>

      {!isUserTurn && !isCompleted && (
        <TouchableOpacity style={styles.simBtn} onPress={handleSimToUserPick} disabled={simulating}>
          <Text style={styles.simBtnText}>{simulating ? "SIMULATING..." : "SIM TO MY PICK"}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={pool.sort((a, b) => b.overall - a.overall)}
        keyExtractor={(item) => item.id}
        renderItem={renderProspect}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.listHeader}>AVAILABLE PROSPECTS</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Recent Picks:</Text>
        <FlatList
          horizontal
          data={[...picks].slice(0, currentPickIndex).reverse()}
          keyExtractor={(item) => `recent-${item.overall}`}
          renderItem={({ item }) => (
            <View style={styles.recentPick}>
              <Text style={styles.recentPickNum}>#{item.overall}</Text>
              <Text style={styles.recentPickName}>{item.player?.lastName}</Text>
              <Text style={styles.recentPickTeam}>{item.teamCity.substring(0,3).toUpperCase()}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, alignItems: 'center', backgroundColor: '#1A202C' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  title: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 4, marginBottom: 0 },
  teamViewBtn: { backgroundColor: '#2D3748', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#4A5568' },
  teamViewBtnText: { color: '#A0AEC0', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  onClockCard: { alignItems: 'center' },
  onClockLabel: { color: '#4A90E2', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  onClockTeam: { color: '#FFF', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  pickNumber: { color: '#A0AEC0', fontSize: 12, fontWeight: 'bold' },
  
  simBtn: { backgroundColor: '#2D3748', margin: 15, padding: 12, borderRadius: 8, alignItems: 'center' },
  simBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  listHeader: { fontSize: 12, fontWeight: '900', color: '#718096', marginVertical: 15, letterSpacing: 1 },
  
  playerCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 18, fontWeight: '900', color: '#1A202C' },
  playerSub: { color: '#718096', fontWeight: 'bold', fontSize: 12, marginTop: 2 },
  ratingBox: { alignItems: 'center', marginRight: 15 },
  ratingVal: { fontSize: 20, fontWeight: '900', color: '#4A90E2' },
  ratingLabel: { fontSize: 8, color: '#A0AEC0', fontWeight: 'bold' },
  pickBtn: { backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  pickBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12 },

  footer: { backgroundColor: '#F7FAFC', padding: 15, borderTopWidth: 1, borderColor: '#EDF2F7' },
  footerText: { fontSize: 10, fontWeight: '900', color: '#718096', marginBottom: 10, letterSpacing: 1 },
  recentPick: { backgroundColor: '#FFF', padding: 8, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#EDF2F7', alignItems: 'center', width: 70 },
  recentPickNum: { fontSize: 10, fontWeight: 'bold', color: '#4A90E2' },
  recentPickName: { fontSize: 11, fontWeight: '900', marginVertical: 2 },
  recentPickTeam: { fontSize: 9, color: '#718096', fontWeight: 'bold' },
});

export default DraftScreen;