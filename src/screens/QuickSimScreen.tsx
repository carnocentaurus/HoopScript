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
import { getNarrative, GameNarrative as NarrativeType } from '../utils/narrativeEngine';

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
  const [dynamicNarrative, setDynamicNarrative] = useState<NarrativeType | null>(null);

  // Update narrative whenever we open analysis or switch to analysis tab
  useEffect(() => {
    if (result && (showAnalysisModal || activeTab === 'ANALYSIS')) {
      const narrative = getNarrative({
        userWon: result.myScore > result.oppScore,
        tacticsSuccessful: result.efficiencyDelta > 0,
        coachIQ: save.coachingIQ,
        myScore: result.myScore,
        oppScore: result.oppScore
      });
      setDynamicNarrative({
        ...narrative,
        lossReason: result.gameNarrative.lossReason
      });
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
    return selectCPUStrategy();
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

    // Sort stats by OVR descending to ensure starters (top 5) are first 
    // and bench is ordered by quality.
    gameResult.myTeamStats.sort((a, b) => b.overall - a.overall);
    gameResult.oppTeamStats.sort((a, b) => b.overall - a.overall);

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
                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>OPPONENT EXPECTED</Text>
                       <Text style={globalStyles.analysisValue}>
                          {save.lastScoutReport?.predictedOffense} / {save.lastScoutReport?.predictedDefense}
                       </Text>
                    </View>

                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>OPPONENT ACTUAL</Text>
                       <Text style={globalStyles.analysisValue}>
                          {result?.finalOppStrategy.offense} / {result?.finalOppStrategy.defense}
                       </Text>
                       <Text style={result?.wasOppCountered ? globalStyles.analysisCounterWinText : globalStyles.analysisCounterText}>
                         {result?.wasOppCountered 
                           ? `DEFENSIVE LOCK: YOU NEUTRALIZED THEIR ${result?.finalOppStrategy.offense}`
                           : `DEFENSIVE HOLE: THEIR ${result?.finalOppStrategy.offense} BROKE THROUGH`
                         }
                       </Text>
                    </View>

                    <View style={globalStyles.analysisRow}>
                       <Text style={globalStyles.analysisLabel}>YOUR SELECTION</Text>
                       <Text style={globalStyles.analysisValue}>
                          {result?.finalUserStrategy.offense} / {result?.finalUserStrategy.defense}
                       </Text>
                       <Text style={result?.wasUserCountered ? globalStyles.analysisCounterText : globalStyles.analysisCounterWinText}>
                         {result?.wasUserCountered 
                           ? `OFFENSIVE STALL: YOUR ${result?.finalUserStrategy.offense} WAS NEUTRALIZED`
                           : `OFFENSIVE SUCCESS: YOUR ${result?.finalUserStrategy.offense} WAS EFFECTIVE`
                         }
                       </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 15 }} />

                    {result && dynamicNarrative && (
                      <View>
                        {result.myScore < result.oppScore && dynamicNarrative.lossReason && (
                          <View style={{ backgroundColor: 'rgba(179, 71, 38, 0.1)', padding: 12, borderRadius: 8, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#B34726' }}>
                             <Text style={{ color: '#B34726', fontSize: 10, fontFamily: 'Oswald', marginBottom: 4 }}>WHY WE LOST</Text>
                             <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.secondary }}>{dynamicNarrative.lossReason}</Text>
                          </View>
                        )}
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
