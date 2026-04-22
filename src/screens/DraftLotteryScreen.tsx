import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { LotteryResult } from '../types/save';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface DraftLotteryScreenProps {
  results: LotteryResult[];
  onComplete: () => void;
}

const DraftLotteryScreen = ({ results, onComplete }: DraftLotteryScreenProps) => {
  const [phase, setViewPhase] = useState<'projected' | 'reveal'>('projected');
  const [revealedCount, setRevealedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { playClickSound } = useSound();
  
  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };
  
  // revealOrder: index 0 is pick 14, index 13 is pick 1
  const revealOrder = [...results].sort((a, b) => b.pick - a.pick); 
  const displayResults = [...results].sort((a, b) => a.pick - b.pick);

  useEffect(() => {
    let interval: any;
    if (phase === 'reveal' && revealedCount < 14) {
      interval = setInterval(() => {
        playClickSound(); // Play sound on each reveal
        setRevealedCount(prev => {
          if (prev >= 13) {
            clearInterval(interval);
            setIsFinished(true);
            return 14;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, revealedCount]);

  if (phase === 'projected') {
    const projected = [...results].sort((a, b) => a.rank - b.rank);

    return (
      <Screen>
        <View style={globalStyles.dlHeader}>
          <Text style={globalStyles.dlTitle}>DRAFT LOTTERY</Text>
          <Text style={globalStyles.dlSubtitle}>PROJECTED DRAFT ORDER</Text>
        </View>

        <ScrollView style={globalStyles.dlProjectedList}>
          {projected.map((res) => {
            const logo = TEAM_LOGOS[res.city];
            return (
              <View key={res.city} style={globalStyles.dlProjectedRow}>
                <View style={globalStyles.flexRowAlignCenter}>
                  {logo && <Image source={logo} style={globalStyles.stLogoImage} />}
                  <View>
                    <Text style={globalStyles.dlProjectedCity}>{res.city}</Text>
                    <Text style={globalStyles.dlProjectedSub}>
                      {res.confRank}th in {res.conference}
                    </Text>
                  </View>
                </View>
                <Text style={globalStyles.dlProjectedPick}>Pick #{res.rank}</Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          style={globalStyles.dlBeginBtn} 
          onPress={() => handlePress(() => setViewPhase('reveal'))}
        >
          <Text style={globalStyles.dlBeginBtnText}>BEGIN LOTTERY</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  // Reveal Phase
  const currentPickIndex = Math.min(revealedCount, 13);
  const currentRevealing = revealOrder[currentPickIndex];
  const revealLogo = TEAM_LOGOS[currentRevealing.city];

  return (
    <Screen>
      <ScrollView contentContainerStyle={globalStyles.pbContent}>
        <View style={globalStyles.dlHeader}>
          <Text style={globalStyles.dlTitle}>DRAFT LOTTERY</Text>
          <Text style={globalStyles.dlSubtitle}>REVEALING PICKS...</Text>
        </View>

        <View style={globalStyles.dlRevealContainer}>
          <View style={globalStyles.dlActiveReveal}>
            <Text style={globalStyles.dlPickLabel}>Pick #{currentRevealing.pick}</Text>
            <View style={globalStyles.dlCityCard}>
               {revealLogo && <Image source={revealLogo} style={globalStyles.dlLogoImage} />}
               <Text style={globalStyles.dlCityName}>{currentRevealing.city}</Text>
               <Text style={globalStyles.dlRankLabel}>PROBABILITY RANK: {currentRevealing.rank}</Text>
            </View>
          </View>
        </View>

        <View style={globalStyles.dlSummaryList}>
          {displayResults.map((res) => {
            // Find if this team has been revealed yet. 
            // The reveal order is from pick 14 down to pick 1.
            // A team is revealed if its pick number >= currentRevealing.pick
            const isRevealed = res.pick >= currentRevealing.pick || isFinished;
            const logo = TEAM_LOGOS[res.city];
            
            let pickColorStyle = {};
            if (isRevealed) {
              if (res.pick < res.rank) pickColorStyle = globalStyles.textSuccess;
              else if (res.pick > res.rank) pickColorStyle = globalStyles.textError;
            }

            return (
              <View key={res.pick} style={[
                globalStyles.dlSummaryItem, 
                isRevealed && globalStyles.dlRevealedItem
              ]}>
                <Text style={[globalStyles.dlSummaryPick, pickColorStyle]}>#{res.pick}</Text>
                {isRevealed && logo && <Image source={logo} style={globalStyles.dlSummaryLogoImage} />}
                <Text style={globalStyles.dlSummaryCity}>
                  {isRevealed ? res.city : "???"}
                </Text>
                {isRevealed && (
                  <Text style={globalStyles.dlSummaryProj}>
                    PROJ: #{res.rank}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {isFinished && (
          <TouchableOpacity 
            style={globalStyles.dlBeginBtn} 
            onPress={() => handlePress(onComplete)}
          >
            <Text style={globalStyles.dlBeginBtnText}>GO TO DRAFT</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Screen>
  );
};

export default DraftLotteryScreen;
