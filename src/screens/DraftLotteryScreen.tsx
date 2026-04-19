import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { LotteryResult } from '../types/save';

interface DraftLotteryScreenProps {
  results: LotteryResult[];
  onComplete: () => void;
}

const DraftLotteryScreen = ({ results, onComplete }: DraftLotteryScreenProps) => {
  const [phase, setViewPhase] = useState<'projected' | 'reveal'>('projected');
  const [revealedCount, setRevealedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // revealOrder: index 0 is pick 14, index 13 is pick 1
  const revealOrder = [...results].sort((a, b) => b.pick - a.pick); 

  useEffect(() => {
    let interval: any;
    if (phase === 'reveal' && revealedCount < 14) {
      interval = setInterval(() => {
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
          {projected.map((res) => (
            <View key={res.city} style={globalStyles.dlProjectedRow}>
              <Text style={globalStyles.dlProjectedCity}>{res.city.toUpperCase()}</Text>
              <Text style={globalStyles.dlProjectedPick}>PICK #{res.rank}</Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={globalStyles.dlBeginBtn} 
          onPress={() => setViewPhase('reveal')}
        >
          <Text style={globalStyles.dlBeginBtnText}>BEGIN LOTTERY</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  // Reveal Phase
  const currentPickIndex = Math.min(revealedCount, 13);
  const currentRevealing = revealOrder[currentPickIndex];

  return (
    <Screen>
      <View style={globalStyles.dlHeader}>
        <Text style={globalStyles.dlTitle}>DRAFT LOTTERY</Text>
        <Text style={globalStyles.dlSubtitle}>REVEALING PICKS...</Text>
      </View>

      <View style={globalStyles.dlRevealContainer}>
        <View style={globalStyles.dlActiveReveal}>
          <Text style={globalStyles.dlPickLabel}>PICK #{currentRevealing.pick}</Text>
          <View style={globalStyles.dlCityCard}>
             <Text style={globalStyles.dlCityName}>{currentRevealing.city.toUpperCase()}</Text>
             <Text style={globalStyles.dlRankLabel}>PROBABILITY RANK: {currentRevealing.rank}</Text>
             {currentRevealing.pick < currentRevealing.rank && (
               <View style={globalStyles.dlJumpBadge}>
                 <Text style={globalStyles.dlJumpText}>JUMPED UP!</Text>
               </View>
             )}
          </View>
          
          {isFinished && (
            <TouchableOpacity 
              style={globalStyles.dlBeginBtn} 
              onPress={onComplete}
            >
              <Text style={globalStyles.dlBeginBtnText}>GO TO DRAFT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={globalStyles.dlSummaryList}>
        {revealOrder.map((res, idx) => {
          const isRevealed = idx <= revealedCount;
          return (
            <View key={res.pick} style={[
              globalStyles.dlSummaryItem, 
              isRevealed && globalStyles.dlRevealedItem
            ]}>
              <Text style={globalStyles.dlSummaryPick}>#{res.pick}</Text>
              <Text style={globalStyles.dlSummaryCity}>
                {isRevealed ? res.city : "???"}
              </Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
};

export default DraftLotteryScreen;
