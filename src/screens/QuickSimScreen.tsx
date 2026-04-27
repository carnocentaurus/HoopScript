import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave, Strategy } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings, selectCPUStrategy } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

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
  
  // Use actualStrategy from scouting report if it exists and matches opponent
  const [cpuStrategy] = useState<Strategy>(() => {
    if (save.lastScoutReport && save.lastScoutReport.city === opponent.city && save.lastScoutReport.actualStrategy) {
      return save.lastScoutReport.actualStrategy;
    }
    return selectCPUStrategy();
  });

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

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
    setResult(gameResult);
    startQuarterSim(0, gameResult);
  }, []);

  const startQuarterSim = (qIdx: number, gameResult: GameResult) => {
    const qData = gameResult.quarterScores[qIdx];
    let count = 0;
    const previousMy = qIdx === 0 ? 0 : gameResult.quarterScores.slice(0, qIdx).reduce((s, d) => s + d.my, 0);
    const previousOpp = qIdx === 0 ? 0 : gameResult.quarterScores.slice(0, qIdx).reduce((s, d) => s + d.opp, 0);
    
    const targetMy = previousMy + qData.my;
    const targetOpp = previousOpp + qData.opp;

    const interval = setInterval(() => {
      count++;
      setMyScore(prev => Math.min(targetMy, prev + Math.floor(Math.random() * 3)));
      setOppScore(prev => Math.min(targetOpp, prev + Math.floor(Math.random() * 3)));

      if (count > 15) {
        clearInterval(interval);
        setMyScore(targetMy);
        setOppScore(targetOpp);
        
        if (qIdx < 3) {
          startQuarterSim(qIdx + 1, gameResult);
        } else {
          setMyScore(gameResult.myScore);
          setOppScore(gameResult.oppScore);
          setIsFinished(true);
        }
      }
    }, 100);
  };

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

      {/* TACTICAL ANALYSIS MODAL */}
      <Modal visible={showAnalysisModal} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.scoutModalContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={globalStyles.scoutModalTitle}>TACTICAL ANALYSIS</Text>
            </View>
            
            <View style={globalStyles.scoutModalContent}>
              <Text style={globalStyles.scoutModalCity}>Game Summary</Text>
              <View style={globalStyles.scoutModalReport}>
                {result?.counterResults.map((msg, i) => (
                  <Text key={i} style={[globalStyles.scoutModalText, { marginBottom: 10 }]}>
                    • {msg}
                  </Text>
                ))}
              </View>
            </View>

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