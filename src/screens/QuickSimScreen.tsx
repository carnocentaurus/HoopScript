import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave, Strategy, OffensiveFocus, DefensiveFocus } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings, selectCPUStrategy } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS, FONTS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';
import { getNarrative, GameNarrative as NarrativeType, getPostGameAnalysis, getGameIntensity } from '../utils/narrativeEngine';
import { sortRosterByPosition } from '../utils/rosterUtils';

const QuickSimScreen = ({ 
  save, 
  opponent, 
  onFinish, 
  onBack 
}: { 
  save: GameSave, 
  opponent: any, 
  onFinish: (result: GameResult) => void, 
  onBack: () => void 
}) => {
  const { playClickSound } = useSound();
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'STATS' | 'ANALYSIS'>('STATS');
  const [analysisLines, setAnalysisLines] = useState<string[]>([]);

  // Update analysis whenever we open analysis tab
  useEffect(() => {
    if (result && (showAnalysisModal || activeTab === 'ANALYSIS')) {
      const userWon = result.myScore > result.oppScore;
      const scoreDiff = Math.abs(result.myScore - result.oppScore);
      const intensity = getGameIntensity(result.myScore, result.oppScore);

      const lines = getPostGameAnalysis({
        userWon,
        intensity,
        userOffense: result.finalUserStrategy.offense,
        oppDefense: result.finalOppStrategy.defense,
        topScorer: result.myBestPlayer,
        oppBestPlayer: result.oppBestPlayer,
        homeStats: result.myTeamStats,
        awayStats: result.oppTeamStats,
        scoreDiff,
        isCountered: result.wasUserCountered,
        isCountering: result.wasOppCountered
      });
      setAnalysisLines(lines);
    }
  }, [showAnalysisModal, activeTab, result]);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  // Use actualStrategy from scouting report if it exists and matches opponent
  const [cpuStrategy] = useState<Strategy>(() => {
    if (save.lastScoutReport && save.lastScoutReport.city === opponent.city && save.lastScoutReport.actualStrategy) {
      return save.lastScoutReport.actualStrategy;
    }
    const oppTeam = save.standings.find(t => t.city === opponent.city);
    const myTeam = save.standings.find(t => t.city === save.city);
    return selectCPUStrategy(oppTeam!, myTeam, !!save.playoffs);
  });

  const StatTable = ({ stats, potgId }: { stats: any[], potgId?: string }) => (
    <View style={{ flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
      {/* Sticky Player Name Column */}
      <View style={{ backgroundColor: COLORS.secondary, borderRightWidth: 1, borderRightColor: COLORS.border }}>
        <View style={{ paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.secondary }}>
          <Text style={{ color: COLORS.textMuted, fontFamily: FONTS.primary, fontSize: 10, textTransform: 'uppercase' }}>PLAYER</Text>
        </View>
        {stats.map((p, i) => {
          const isPOTG = p.playerId === potgId;
          return (
            <View key={`name-${i}`} style={{ 
              paddingVertical: 10, 
              paddingHorizontal: 15, 
              height: 40,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: i % 2 === 0 ? COLORS.secondary : COLORS.grayLight 
            }}>
              <Text style={{ color: isPOTG ? COLORS.primary : COLORS.textSub, fontFamily: FONTS.primary, fontSize: 9, width: 22 }}>{p.position}</Text>
              <Text style={{ color: isPOTG ? COLORS.primary : COLORS.white, fontFamily: FONTS.secondary, fontSize: 13 }} numberOfLines={1}>{p.lastName}</Text>
            </View>
          );
        })}
      </View>

      {/* Scrollable Stats Columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.secondary }}>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>MIN</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>PTS</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>REB</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>AST</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>STL</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>BLK</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 45 }]}>TO</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 60 }]}>FG</Text>
            <Text style={[globalStyles.stHeaderStat, { width: 60 }]}>3P</Text>
          </View>

          {/* Rows */}
          {stats.map((p, i) => {
            const isPOTG = p.playerId === potgId;
            const rowTextColor = isPOTG ? COLORS.primary : COLORS.text;
            return (
              <View key={`stats-${i}`} style={{ 
                flexDirection: 'row', 
                height: 40,
                alignItems: 'center',
                backgroundColor: i % 2 === 0 ? COLORS.card : COLORS.grayLight 
              }}>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{Math.round(p.min)}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.pts}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.reb}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.ast}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.stl}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.blk}</Text>
                <Text style={[globalStyles.stRecordText, { width: 45, fontFamily: FONTS.secondary, fontSize: 13, color: rowTextColor }]}>{p.tov}</Text>
                <Text style={[globalStyles.stRecordText, { width: 60, fontFamily: FONTS.secondary, fontSize: 11, color: rowTextColor }]}>{p.fgm}/{p.fga}</Text>
                <Text style={[globalStyles.stRecordText, { width: 60, fontFamily: FONTS.secondary, fontSize: 11, color: rowTextColor }]}>{p.threePM}/{p.threePA}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  // Full simulation happens once to get the "script"
  useEffect(() => {
    const userStrategy = save.currentStrategy || {
      offense: OffensiveFocus.ATTACK_PAINT,
      defense: DefensiveFocus.PROTECT_RIM
    };

    const gameResult = simulateGame(
      save, 
      opponent, 
      userStrategy, 
      cpuStrategy,
      save.coachingIQ,
      opponent.coachingIQ ?? 60
    );

    // Apply strict positional sorting (Starters first, then PG->C, then OVR)
    gameResult.myTeamStats = sortRosterByPosition(gameResult.myTeamStats);
    gameResult.oppTeamStats = sortRosterByPosition(gameResult.oppTeamStats);

    setResult(gameResult);
    
    // Smoothly animate score progression over ~4 seconds
    const duration = 4000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setMyScore(Math.floor(gameResult.myScore * progress));
      setOppScore(Math.floor(gameResult.oppScore * progress));

      if (progress >= 1) {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 50); // Tick every 50ms for smoothness

    return () => clearInterval(interval);
  }, []);

  const UserTeam = () => {
    const ratings = calculateTeamRatings(save.roster);
    const logo = TEAM_LOGOS[save.city];

    return (
      <View style={globalStyles.qsTeamSide}>
        {logo ? (
          <Image source={logo} style={globalStyles.qsLogoImage} />
        ) : (
          <Text style={[globalStyles.qsLogoPlaceholder, globalStyles.bgTransparent]}>{save.city.charAt(0)}</Text>
        )}
        <Text style={globalStyles.qsCityName}>{save.city}</Text>
        <View style={globalStyles.ratingsContainer}>
          <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.offense}</Text><Text style={globalStyles.ratingLabel}>OFF</Text></View>
          <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.defense}</Text><Text style={globalStyles.ratingLabel}>DEF</Text></View>
          <View style={globalStyles.ratingBox}><Text style={[globalStyles.ratingVal, globalStyles.ovrVal]}>{ratings.overall}</Text><Text style={globalStyles.ratingLabel}>OVR</Text></View>
        </View>
        <Text style={[globalStyles.qsScore, isFinished && myScore > oppScore && globalStyles.qsWinnerTerracotta]}>{myScore}</Text>
      </View>
    );
  };

  const OpponentTeam = () => {
    const ratings = calculateTeamRatings(opponent.roster);
    const logo = TEAM_LOGOS[opponent.city];

    return (
      <View style={globalStyles.qsTeamSide}>
        {logo ? (
          <Image source={logo} style={globalStyles.qsLogoImage} />
        ) : (
          <Text style={[globalStyles.qsLogoPlaceholder, globalStyles.bgTransparent]}>{opponent.city.charAt(0)}</Text>
        )}
        <Text style={globalStyles.qsCityName}>{opponent.city}</Text>
        <View style={globalStyles.ratingsContainer}>
          <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.offense}</Text><Text style={globalStyles.ratingLabel}>OFF</Text></View>
          <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.defense}</Text><Text style={globalStyles.ratingLabel}>DEF</Text></View>
          <View style={globalStyles.ratingBox}><Text style={[globalStyles.ratingVal, globalStyles.ovrVal]}>{ratings.overall}</Text><Text style={globalStyles.ratingLabel}>OVR</Text></View>
        </View>
        <Text style={[globalStyles.qsScore, isFinished && oppScore > myScore && globalStyles.qsWinnerTerracotta]}>{oppScore}</Text>
      </View>
    );
  };

  return (
    <Screen>
      <View style={globalStyles.qsHeaderRow}>
      </View>
      
      <ScrollView contentContainerStyle={globalStyles.qsScrollContent} showsVerticalScrollIndicator={false}>
        {isFinished && result && result.otCount > 0 && (
          <View style={globalStyles.qsOtBadge}>
            <Text style={globalStyles.qsOtText}>
              {result.otCount === 1 ? 'OVERTIME' : `${result.otCount}OT`}
            </Text>
          </View>
        )}

        <View style={globalStyles.qsScoreBoard}>
          {opponent.isHome ? <UserTeam /> : <OpponentTeam />}
          <Text style={globalStyles.qsVs}>AT</Text>
          {opponent.isHome ? <OpponentTeam /> : <UserTeam />}
        </View>

        {isFinished && result && (
          <View style={globalStyles.qsPostGame}>
            <TouchableOpacity 
              style={[globalStyles.qsContinueButtonTerracotta, { marginBottom: 15 }]} 
              onPress={() => handlePress(() => setShowAnalysisModal(true))}
            >
              <Text style={globalStyles.qsContinueTextBlack}>ANALYSIS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.qsContinueButtonTerracotta} onPress={() => handlePress(() => onFinish(result))}>
              <Text style={globalStyles.qsContinueTextBlack}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showAnalysisModal} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.scoutModalContainer, { maxWidth: 500, height: '80%' }]}>
            {/* TABS */}
            <View style={[globalStyles.flexRow, { marginBottom: 20 }]}>
              <TouchableOpacity 
                style={[globalStyles.flex1, { paddingVertical: 10, borderBottomWidth: 2, borderColor: activeTab === 'STATS' ? COLORS.primary : 'transparent' }]}
                onPress={() => handlePress(() => setActiveTab('STATS'))}
              >
                <Text style={{ textAlign: 'center', color: activeTab === 'STATS' ? COLORS.primary : COLORS.textSub, fontFamily: 'Oswald' }}>STATS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.flex1, { paddingVertical: 10, borderBottomWidth: 2, borderColor: activeTab === 'ANALYSIS' ? COLORS.primary : 'transparent' }]}
                onPress={() => handlePress(() => setActiveTab('ANALYSIS'))}
              >
                <Text style={{ textAlign: 'center', color: activeTab === 'ANALYSIS' ? COLORS.primary : COLORS.textSub, fontFamily: 'Oswald' }}>ANALYSIS</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {activeTab === 'STATS' ? (
                <View>
                  <Text style={[globalStyles.scoutModalCity, { fontSize: 14, marginBottom: 15 }]}>{save.city.toUpperCase()}</Text>
                  <StatTable stats={result?.myTeamStats || []} potgId={result?.myPOTGId} />
                  
                  <Text style={[globalStyles.scoutModalCity, { fontSize: 14, marginVertical: 15 }]}>{opponent.city.toUpperCase()}</Text>
                  <StatTable stats={result?.oppTeamStats || []} potgId={result?.oppPOTGId} />
                </View>
              ) : (
                <View style={globalStyles.scoutModalContent}>
                  <Text style={globalStyles.scoutModalCity}>Tactical Analysis</Text>
                  <View style={globalStyles.scoutModalReport}>
                    {save.lastScoutReport && (
                      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 8, marginBottom: 15 }}>
                        <Text style={{ color: COLORS.textSub, fontSize: 10, fontFamily: 'Oswald', letterSpacing: 1 }}>COACHING PROFILE</Text>
                        <Text style={{ color: COLORS.primary, fontSize: 16, fontFamily: 'Oswald', marginVertical: 4 }}>{save.lastScoutReport.coachingProfile}</Text>
                        <Text style={{ color: COLORS.white, fontSize: 11, fontFamily: FONTS.secondary, opacity: 0.8 }}>
                          Tendency to Adjust: <Text style={{ color: save.lastScoutReport.adjustmentTendency === 'High' ? COLORS.primary : COLORS.white }}>{save.lastScoutReport.adjustmentTendency}</Text>
                        </Text>
                      </View>
                    )}

                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>OPPONENT EXPECTED</Text>
                       {save.lastScoutReport?.displayMode === 'dual' && save.lastScoutReport.possibleStrategies ? (
                         <View>
                           {save.lastScoutReport.possibleStrategies.map((strat, idx) => (
                             <Text key={idx} style={globalStyles.analysisValue}>
                               {strat.offense} / {strat.defense}
                             </Text>
                           ))}
                         </View>
                       ) : (
                         <Text style={globalStyles.analysisValue}>
                            {save.lastScoutReport?.predictedOffense} / {save.lastScoutReport?.predictedDefense}
                         </Text>
                       )}
                    </View>

                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>OPPONENT ACTUAL</Text>
                       <Text style={globalStyles.analysisValue}>
                          {result?.finalOppStrategy.offense} / {result?.finalOppStrategy.defense}
                       </Text>
                       {result?.oppAdjustedMidGame && (
                         <Text style={{ color: COLORS.primary, fontSize: 9, fontFamily: 'Oswald', marginTop: 2 }}>* ADJUSTED DEFENSE IN 2ND HALF</Text>
                       )}
                       <Text style={result?.wasOppCountered ? globalStyles.analysisCounterWinText : (result?.wasOppExploiting ? globalStyles.analysisCounterText : { color: COLORS.textMuted, fontSize: 10, fontFamily: 'Oswald', marginTop: 5 })}>
                         {result?.wasOppCountered 
                           ? `DEFENSIVE LOCK: YOU NEUTRALIZED THEIR ${result?.finalOppStrategy.offense}`
                           : result?.wasOppExploiting 
                             ? `DEFENSIVE HOLE: THEIR ${result?.finalOppStrategy.offense} BROKE THROUGH`
                             : `DEFENSIVE STALEMATE: STANDARD COVERAGE`
                         }
                       </Text>
                    </View>

                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>YOUR SELECTION</Text>
                       <Text style={globalStyles.analysisValue}>
                          {result?.finalUserStrategy.offense} / {result?.finalUserStrategy.defense}
                       </Text>
                       {result?.userAdjustedMidGame && (
                         <Text style={{ color: COLORS.primary, fontSize: 9, fontFamily: 'Oswald', marginTop: 2 }}>* ADJUSTED DEFENSE IN 2ND HALF</Text>
                       )}
                       <Text style={result?.wasUserCountered ? globalStyles.analysisCounterText : (result?.wasUserExploiting ? globalStyles.analysisCounterWinText : { color: COLORS.textMuted, fontSize: 10, fontFamily: 'Oswald', marginTop: 5 })}>
                         {result?.wasUserCountered 
                           ? `OFFENSIVE STALL: YOUR ${result?.finalUserStrategy.offense} WAS NEUTRALIZED`
                           : result?.wasUserExploiting 
                             ? `OFFENSIVE SUCCESS: YOUR ${result?.finalUserStrategy.offense} WAS EFFECTIVE`
                             : `OFFENSIVE STALEMATE: STANDARD EXECUTION`
                         }
                       </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 15 }} />

                    {result && (
                      <View>
                        <View style={{ 
                          backgroundColor: result.myScore > result.oppScore ? 'rgba(76, 175, 80, 0.1)' : 'rgba(179, 71, 38, 0.1)', 
                          padding: 15, 
                          borderRadius: 12, 
                          marginBottom: 15, 
                          borderLeftWidth: 4, 
                          borderLeftColor: result.myScore > result.oppScore ? COLORS.success : '#B34726',
                          borderWidth: 1,
                          borderColor: COLORS.border
                        }}>
                           <Text style={{ color: result.myScore > result.oppScore ? COLORS.success : '#B34726', fontSize: 12, fontFamily: 'Oswald', marginBottom: 8, letterSpacing: 1 }}>
                             {result.myScore > result.oppScore ? 'GAME SUMMARY (WIN)' : 'GAME SUMMARY (LOSS)'}
                           </Text>
                           {analysisLines.map((line, idx) => (
                             <View key={idx} style={{ flexDirection: 'row', marginBottom: 6 }}>
                               <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.secondary, marginRight: 8, opacity: 0.7 }}>•</Text>
                               <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.secondary, flex: 1, lineHeight: 18 }}>
                                 {line}
                               </Text>
                             </View>
                           ))}
                           {result.oppAdjustedMidGame && (
                             <View style={{ flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                               <Text style={{ color: COLORS.primary, fontSize: 11, fontFamily: FONTS.secondary, lineHeight: 16 }}>
                                 NOTE: The opposing coach adjusted their defense mid-game to better counter your offensive scheme.
                               </Text>
                             </View>
                           )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={globalStyles.scoutModalCloseBtn}
              onPress={() => handlePress(() => setShowAnalysisModal(false))}
            >
              <Text style={globalStyles.scoutModalCloseBtnText}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

export default QuickSimScreen;
