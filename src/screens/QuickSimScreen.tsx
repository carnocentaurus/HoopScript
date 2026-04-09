import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave } from '../types/save';

const QuickSimScreen = ({ save, opponent, onFinish }: { save: GameSave, opponent: any, onFinish: (result: GameResult) => void }) => {
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

  const PlayerStats = ({ player }: { player: any }) => (
    <View style={styles.statCard}>
      {/* Position and Number Badge */}
      <View style={styles.badgeRow}>
        <Text style={styles.playerMeta}>#{player.number}</Text>
        <Text style={styles.playerPos}>{player.position}</Text>
      </View>
      <Text style={styles.statName} numberOfLines={1}>{player.lastName}</Text>
      <Text style={styles.statLine}>
        {player.pts} PTS | {player.reb} REB | {player.ast} AST
      </Text>
      <Text style={styles.statLine}>
        {player.fgm}/{player.fga} FG
      </Text>
      <Text style={styles.statLineSmall}>
        {player.min} MIN | {player.stl} STL | {player.blk} BLK
      </Text>
    </View>
  );

  const UserTeam = () => (
    <View style={styles.teamSide}>
      <Text style={styles.logoPlaceholder}>{save.city.charAt(0)}</Text>
      <Text style={styles.cityName}>{save.city}</Text>
      <Text style={[styles.score, isFinished && myScore > oppScore && styles.winner]}>{myScore}</Text>
    </View>
  );

  const OpponentTeam = () => (
    <View style={styles.teamSide}>
      <Text style={styles.logoPlaceholder}>{opponent.city.charAt(0)}</Text>
      <Text style={styles.cityName}>{opponent.city}</Text>
      <Text style={[styles.score, isFinished && oppScore > myScore && styles.winner]}>{oppScore}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Overtime Badge - Shows only if score exceeded 120 (loose logic) or passed from sim */}
      {isFinished && (result?.myScore! > 125 || result?.oppScore! > 125) && (
        <View style={styles.otBadge}>
           <Text style={styles.otText}>OVERTIME</Text>
        </View>
      )}

      <View style={styles.scoreBoard}>
        {opponent.isHome ? <OpponentTeam /> : <UserTeam />}
        <Text style={styles.vs}>AT</Text>
        {opponent.isHome ? <UserTeam /> : <OpponentTeam />}
      </View>

      {isFinished && result && (
        <View style={styles.postGame}>
          <Text style={styles.sectionTitle}>PLAYERS OF THE GAME</Text>
          <View style={styles.bestPlayersRow}>
            {opponent.isHome ? (
                <>
                  <PlayerStats player={result.oppBestPlayer} />
                  <PlayerStats player={result.myBestPlayer} />
                </>
            ) : (
                <>
                  <PlayerStats player={result.myBestPlayer} />
                  <PlayerStats player={result.oppBestPlayer} />
                </>
            )}
          </View>
          
          <TouchableOpacity style={styles.continueButton} onPress={() => onFinish(result)}>
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center' },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  teamSide: { alignItems: 'center', flex: 1 },
  logoPlaceholder: { fontSize: 40, color: '#FFF', fontWeight: '900', backgroundColor: '#333', width: 80, height: 80, textAlign: 'center', lineHeight: 80, borderRadius: 40, marginBottom: 10 },
  cityName: { color: '#AAA', fontSize: 12, fontWeight: 'bold' },
  score: { color: '#FFF', fontSize: 48, fontWeight: '900', marginTop: 10 },
  vs: { color: '#444', fontWeight: '900', fontSize: 18 },
  winner: { color: '#4CAF50' },
  otBadge: { alignSelf: 'center', backgroundColor: '#C41E3A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  otText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  postGame: { marginTop: 40, paddingHorizontal: 20 },
  sectionTitle: { color: '#555', textAlign: 'center', fontSize: 10, letterSpacing: 2, marginBottom: 20 },
  bestPlayersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#222', padding: 12, borderRadius: 10, width: '48%' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  playerMeta: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  playerPos: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  statName: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 5 },
  statLine: { color: '#CCC', fontSize: 11, lineHeight: 16 },
  statLineSmall: { color: '#777', fontSize: 10, marginTop: 4 },
  continueButton: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 40 },
  continueText: { fontWeight: '900', fontSize: 16, color: '#000' }
});

export default QuickSimScreen;