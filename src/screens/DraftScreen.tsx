import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Player, DraftState } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

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
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!isUserTurn && currentPickIndex < picks.length && !simulating && !isCompleted) {
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
    <View style={globalStyles.drPlayerCard}>
      <View style={globalStyles.drPlayerInfo}>
        <Text style={globalStyles.drPlayerName}>{item.lastName}</Text>
        <Text style={globalStyles.drPlayerSub}>{item.position} | AGE {item.age}</Text>
      </View>
      <View style={globalStyles.drRatingBox}>
        <Text style={globalStyles.drRatingVal}>{item.overall}</Text>
        <Text style={globalStyles.drRatingLabel}>OVR</Text>
      </View>
      {isUserTurn && !simulating && (
        <TouchableOpacity 
          style={globalStyles.drPickBtn} 
          onPress={() => handlePress(() => {
            Alert.alert("Draft Player", `Are you sure you want to draft ${item.lastName}?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Draft", onPress: () => onPick(item) }
            ]);
          })}
        >
          <Text style={globalStyles.drPickBtnText}>PICK</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isCompleted) {
    return (
      <Screen>
        <View style={globalStyles.drHeader}>
          <Text style={globalStyles.drTitle}>DRAFT SUMMARY</Text>
          <Text style={globalStyles.drOnClockLabel}>ALL PICKS COMPLETED</Text>
        </View>

        <FlatList
          data={picks}
          keyExtractor={(item) => `final-${item.overall}`}
          renderItem={({ item }) => {
            const logo = TEAM_LOGOS[item.teamCity];

            return (
              <View style={[globalStyles.drSummaryRow, item.teamCity === userCity && globalStyles.drUserSummaryRow]}>
                <Text style={globalStyles.drSummaryPick}>#{item.overall}</Text>
                {logo && <Image source={logo} style={globalStyles.drLogoImage} />}
                <View style={globalStyles.drSummaryInfo}>
                  <Text style={[globalStyles.drSummaryTeam, item.teamCity === userCity && globalStyles.textTerracotta]}>
                    {item.teamCity.toUpperCase()}
                  </Text>
                  <Text style={globalStyles.drSummaryPlayer}>{item.player?.lastName}</Text>
                </View>
                <View style={globalStyles.drSummaryRating}>
                  <Text style={globalStyles.drSummaryRatingVal}>{item.player?.overall}</Text>
                  <Text style={globalStyles.drSummaryRatingLabel}>OVR</Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={globalStyles.drListContainer}
        />

        <TouchableOpacity 
          style={[globalStyles.drStartSeasonBtn, globalStyles.bgTerracotta]} 
          onPress={() => handlePress(onComplete)}
        >
          <Text style={[globalStyles.drStartSeasonBtnText, globalStyles.textBlackBold]}>NEXT SEASON</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={globalStyles.drHeader}>
        <View style={globalStyles.drHeaderTop}>
          <Text style={globalStyles.drTitle}>ROOKIE DRAFT</Text>
          <TouchableOpacity onPress={() => handlePress(onViewTeam)}>
            <Icon name="people-outline" size={32} color="#B34726" />
          </TouchableOpacity>
        </View>

        {currentPick && (
          <View style={globalStyles.drOnClockCard}>
            <Text style={globalStyles.drOnClockLabel}>ON THE CLOCK</Text>
            <Text style={globalStyles.drOnClockTeam}>{currentPick.teamCity.toUpperCase()}</Text>
            <Text style={globalStyles.drPickNumber}>Round {currentPick.round} | Pick {currentPick.overall}</Text>
          </View>
        )}
      </View>

      {!isUserTurn && !isCompleted && (
        <TouchableOpacity 
          style={[globalStyles.drSimBtn, globalStyles.bgTerracotta]} 
          onPress={() => handlePress(handleSimToUserPick)} 
          disabled={simulating}
        >
          <Text style={[globalStyles.drSimBtnText, globalStyles.textBlackBold]}>
            {simulating ? "SIMULATING..." : "SIM TO MY PICK"}
          </Text>
        </TouchableOpacity>
      )}

      {isUserTurn && !simulating && !isCompleted && (
        <FlatList
          data={pool.sort((a, b) => b.overall - a.overall)}
          keyExtractor={(item) => item.id}
          renderItem={renderProspect}
          contentContainerStyle={globalStyles.drListContainer}
          ListHeaderComponent={<Text style={globalStyles.drListHeader}>AVAILABLE PROSPECTS</Text>}
        />
      )}
    </Screen>
  );
};

export default DraftScreen;