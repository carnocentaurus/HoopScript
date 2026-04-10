import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';

const QuickSimScreen = ({ save, opponent, onFinish }: { save: GameSave, opponent: any, onFinish: (result: GameResult) => void }) => {
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showBoxScore, setShowBoxScore] = useState(false);

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
      <View style={styles.badgeRow}>
        <Text style={styles.playerMeta}>#{player.number}</Text>
        <Text style={styles.playerPos}>{player.position} | {player.overall} OVR</Text>
      </View>
      <Text style={styles.statName} numberOfLines={1}>{player.lastName}</Text>
      
      <View style={styles.verticalStats}>
        <Text style={styles.statValue}>{player.min} MIN</Text>
        <Text style={styles.statValue}>{player.fgm}/{player.fga} FG</Text>
        <Text style={styles.statValueMain}>{player.pts} PTS</Text>
        <Text style={styles.statValue}>{player.reb} REB</Text>
        <Text style={styles.statValue}>{player.ast} AST</Text>
        <Text style={styles.statValue}>{player.stl} STL</Text>
        <Text style={styles.statValue}>{player.blk} BLK</Text>
      </View>
    </View>
  );

  const BoxScoreTable = ({ teamName, stats }: { teamName: string, stats: any[] }) => (
    <View style={styles.boxScoreContainer}>
      <Text style={styles.boxScoreTitle}>{teamName} BOX SCORE</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.cellName]}>PLAYER</Text>
        <Text style={styles.cell}>MIN</Text>
        <Text style={styles.cell}>PTS</Text>
        <Text style={styles.cell}>REB</Text>
        <Text style={styles.cell}>AST</Text>
        <Text style={styles.cell}>FG</Text>
      </View>
      {stats.map((p, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={[styles.cell, styles.cellName]} numberOfLines={1}>
            {p.position} {p.lastName}
          </Text>
          <Text style={styles.cell}>{p.min}</Text>
          <Text style={[styles.cell, styles.cellHighlight]}>{p.pts}</Text>
          <Text style={styles.cell}>{p.reb}</Text>
          <Text style={styles.cell}>{p.ast}</Text>
          <Text style={styles.cell}>{p.fgm}/{p.fga}</Text>
        </View>
      ))}
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
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isFinished && (result?.myScore! > 125 || result?.oppScore! > 125) && (
          <View style={styles.otBadge}>
             <Text style={styles.otText}>OVERTIME</Text>
          </View>
        )}

        <View style={styles.scoreBoard}>
          {opponent.isHome ? <UserTeam /> : <OpponentTeam />}
          <Text style={styles.vs}>AT</Text>
          {opponent.isHome ? <OpponentTeam /> : <UserTeam />}
        </View>

        {isFinished && result && (
          <View style={styles.postGame}>
            
            {!showBoxScore ? (
              <>
                <Text style={styles.sectionTitle}>PLAYERS OF THE GAME</Text>
                <View style={styles.bestPlayersRow}>
                  {opponent.isHome ? (
                      <>
                        <PlayerStats player={result.myBestPlayer} />
                        <PlayerStats player={result.oppBestPlayer} />
                      </>
                  ) : (
                      <>
                        <PlayerStats player={result.oppBestPlayer} />
                        <PlayerStats player={result.myBestPlayer} />
                      </>
                  )}
                </View>
              </>
            ) : (
              <BoxScoreTable 
                teamName={save.city} 
                stats={result.myTeamStats || []} 
              />
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setShowBoxScore(!showBoxScore)}
              >
                <Text style={styles.secondaryText}>
                  {showBoxScore ? "HIDE BOX SCORE" : "FULL BOX SCORE"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.continueButton} onPress={() => onFinish(result)}>
                <Text style={styles.continueText}>CONTINUE</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
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
  sectionTitle: { color: '#444', textAlign: 'center', fontSize: 10, letterSpacing: 2, marginBottom: 15 },
  bestPlayersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#111', padding: 15, borderRadius: 12, width: '48%', borderWidth: 1, borderColor: '#222' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  playerMeta: { color: '#C41E3A', fontSize: 10, fontWeight: '900' },
  playerPos: { color: '#555', fontSize: 10, fontWeight: 'bold' },
  statName: { color: '#FFF', fontWeight: '900', fontSize: 17, marginBottom: 10, textTransform: 'uppercase' },
  verticalStats: { gap: 2 },
  statValue: { color: '#777', fontSize: 13, fontWeight: '600' },
  statValueMain: { color: '#FFF', fontSize: 15, fontWeight: '900', marginVertical: 2 },
  
  /* Box Score Styles */
  boxScoreContainer: { backgroundColor: '#111', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#222', marginBottom: 10 },
  boxScoreTitle: { color: '#FFF', fontWeight: '900', fontSize: 14, marginBottom: 15, textAlign: 'center', letterSpacing: 1 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#222' },
  cell: { flex: 1, color: '#888', fontSize: 11, textAlign: 'center', fontWeight: '600' },
  cellName: { flex: 2.5, textAlign: 'left', color: '#CCC' },
  cellHighlight: { color: '#FFF', fontWeight: '900' },

  buttonRow: { flexDirection: 'column', gap: 10, marginTop: 20 },
  secondaryButton: { backgroundColor: '#222', padding: 15, borderRadius: 12, alignItems: 'center' },
  secondaryText: { fontWeight: '900', fontSize: 14, color: '#FFF', letterSpacing: 1 },
  continueButton: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  continueText: { fontWeight: '900', fontSize: 16, color: '#000' }
});

export default QuickSimScreen;