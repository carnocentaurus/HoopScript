import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';

const QuickSimScreen = ({ save, opponent, onFinish, onBack }: { save: GameSave, opponent: any, onFinish: (result: GameResult) => void, onBack: () => void }) => {
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    const gameResult = simulateGame(save, opponent);
    setResult(gameResult);

    const finalMy = gameResult.myScore;
    const finalOpp = gameResult.oppScore;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setMyScore(prev => Math.min(finalMy, prev + Math.floor(Math.random() * 8)));
      setOppScore(prev => Math.min(finalOpp, prev + Math.floor(Math.random() * 8)));
      
      if (count > 30) {
        clearInterval(interval);
        setMyScore(finalMy);
        setOppScore(finalOpp);
        setIsFinished(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [save, opponent]);

  const UserTeam = () => {
    const ratings = calculateTeamRatings(save.roster);

    return (
      <View style={styles.teamSide}>
        <Text style={styles.logoPlaceholder}>{save.city.charAt(0)}</Text>
        <Text style={styles.cityName}>{save.city}</Text>
        <View style={styles.ratingsContainer}>
          <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.offense}</Text><Text style={styles.ratingLabel}>OFF</Text></View>
          <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.defense}</Text><Text style={styles.ratingLabel}>DEF</Text></View>
          <View style={styles.ratingBox}><Text style={[styles.ratingVal, styles.ovrVal]}>{ratings.overall}</Text><Text style={styles.ratingLabel}>OVR</Text></View>
        </View>
        <Text style={[styles.score, isFinished && myScore > oppScore && styles.winner]}>{myScore}</Text>
      </View>
    );
  };

  const OpponentTeam = () => {
    const ratings = calculateTeamRatings(opponent.roster);

    return (
      <View style={styles.teamSide}>
        <Text style={styles.logoPlaceholder}>{opponent.city.charAt(0)}</Text>
        <Text style={styles.cityName}>{opponent.city}</Text>
        <View style={styles.ratingsContainer}>
          <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.offense}</Text><Text style={styles.ratingLabel}>OFF</Text></View>
          <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.defense}</Text><Text style={styles.ratingLabel}>DEF</Text></View>
          <View style={styles.ratingBox}><Text style={[styles.ratingVal, styles.ovrVal]}>{ratings.overall}</Text><Text style={styles.ratingLabel}>OVR</Text></View>
        </View>
        <Text style={[styles.score, isFinished && oppScore > myScore && styles.winner]}>{oppScore}</Text>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isFinished && result && result.otCount > 0 && (
          <View style={styles.otBadge}>
            <Text style={styles.otText}>
              {result.otCount === 1 ? 'OVERTIME' : `${result.otCount}OT`}
            </Text>
          </View>
        )}

        <View style={styles.scoreBoard}>
          {opponent.isHome ? <UserTeam /> : <OpponentTeam />}
          <Text style={styles.vs}>AT</Text>
          {opponent.isHome ? <OpponentTeam /> : <UserTeam />}
        </View>

        {isFinished && result && (
          <View style={styles.postGame}>
            <TouchableOpacity style={styles.continueButton} onPress={() => onFinish(result)}>
              <Text style={styles.continueText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  headerRow: { padding: 15, paddingBottom: 0 },
  backBtn: { padding: 10, width: 60 },
  backBtnText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 12 },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  teamSide: { alignItems: 'center', flex: 1 },
  logoPlaceholder: { fontSize: 40, color: '#FFF', fontWeight: '900', backgroundColor: '#222', width: 80, height: 80, textAlign: 'center', lineHeight: 80, borderRadius: 40, marginBottom: 10 },
  cityName: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  score: { color: '#2D3748', fontSize: 54, fontWeight: '900', marginTop: 10 },
  vs: { color: '#333', fontWeight: '900', fontSize: 18 },
  winner: { color: '#4CAF50' },
  otBadge: { alignSelf: 'center', backgroundColor: '#C41E3A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  otText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  postGame: { marginTop: 10, paddingHorizontal: 20 },
  
  ratingsContainer: { flexDirection: 'row', gap: 15, marginTop: 10 },
  ratingBox: { alignItems: 'center' },
  ratingVal: { fontSize: 13, fontWeight: '900', color: '#2D3748' },
  ovrVal: { color: '#4A90E2' },
  ratingLabel: { fontSize: 8, color: '#A0AEC0', fontWeight: 'bold' },

  continueButton: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  continueText: { fontWeight: '900', fontSize: 16, color: '#000' }
});

export default QuickSimScreen;