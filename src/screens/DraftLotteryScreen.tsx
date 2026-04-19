import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

interface LotteryResult {
  city: string;
  rank: number; // 1-14 (1 is worst record)
  pick: number; // 1-14 (final pick)
}

interface DraftLotteryScreenProps {
  results: LotteryResult[];
  onComplete: () => void;
}

const DraftLotteryScreen = ({ results, onComplete }: DraftLotteryScreenProps) => {
  const [revealedIndex, setRevealedIndex] = useState(15); // Start at 15 (none revealed)
  const [isFinished, setIsFinished] = useState(false);
  
  // Sort results by pick descending (14 down to 1)
  const sortedResults = [...results].sort((a, b) => b.pick - a.pick);

  const revealNext = () => {
    if (revealedIndex > 1) {
      setRevealedIndex(prev => prev - 1);
    } else {
      setIsFinished(true);
    }
  };

  const currentRevealing = sortedResults.find(r => r.pick === revealedIndex);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>DRAFT LOTTERY</Text>
        <Text style={styles.subtitle}>REVEALING THE TOP 14 PICKS</Text>
      </View>

      <View style={styles.revealContainer}>
        {revealedIndex > 14 ? (
          <TouchableOpacity style={styles.startBtn} onPress={revealNext}>
            <Text style={styles.startBtnText}>START LOTTERY REVEAL</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeReveal}>
            <Text style={styles.pickLabel}>PICK #{revealedIndex}</Text>
            <View style={styles.cityCard}>
               <Text style={styles.cityName}>{currentRevealing?.city.toUpperCase()}</Text>
               <Text style={styles.rankLabel}>PROBABILITY RANK: {currentRevealing?.rank}</Text>
               {currentRevealing && currentRevealing.pick < currentRevealing.rank && (
                 <View style={styles.jumpBadge}>
                   <Text style={styles.jumpText}>JUMPED UP!</Text>
                 </View>
               )}
            </View>
            
            {!isFinished ? (
              <TouchableOpacity style={styles.nextBtn} onPress={revealNext}>
                <Text style={styles.nextBtnText}>{revealedIndex === 1 ? "FINISH" : "NEXT PICK"}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.finishBtn} onPress={onComplete}>
                <Text style={styles.finishBtnText}>GO TO DRAFT</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.summaryList}>
        {sortedResults.map((res) => (
          <View key={res.pick} style={[
            styles.summaryItem, 
            res.pick >= revealedIndex && styles.revealedItem
          ]}>
            <Text style={styles.summaryPick}>#{res.pick}</Text>
            <Text style={styles.summaryCity}>
              {res.pick >= revealedIndex ? res.city : "???"}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  revealContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  startBtnText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 16,
  },
  activeReveal: {
    alignItems: 'center',
    width: '100%',
  },
  pickLabel: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  cityCard: {
    backgroundColor: COLORS.card,
    width: '100%',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  cityName: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  rankLabel: {
    color: COLORS.textSub,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  jumpBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 15,
  },
  jumpText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  nextBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  nextBtnText: {
    color: COLORS.white,
    fontWeight: '900',
  },
  finishBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  finishBtnText: {
    color: COLORS.black,
    fontWeight: '900',
  },
  summaryList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  summaryItem: {
    width: '45%',
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    margin: 5,
    padding: 10,
    borderRadius: 8,
    opacity: 0.3,
  },
  revealedItem: {
    opacity: 1,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  summaryPick: {
    color: COLORS.primary,
    fontWeight: '900',
    width: 30,
  },
  summaryCity: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default DraftLotteryScreen;
