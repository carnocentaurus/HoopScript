import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameResult, simulateGame } from '../utils/gameSim';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

const QuickSimScreen = ({ save, opponent, onFinish, onBack }: { save: GameSave, opponent: any, onFinish: (result: GameResult) => void, onBack: () => void }) => {
  const { playClickSound } = useSound();
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  useEffect(() => {
    const gameResult = simulateGame(save, opponent);
// ... rest of useEffect remains the same ...
    setResult(gameResult);

    const finalMy = gameResult.myScore;
    const finalOpp = gameResult.oppScore;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setMyScore(prev => Math.min(finalMy, prev + Math.floor(Math.random() * 8)));
      setOppScore(prev => Math.min(finalOpp, prev + Math.floor(Math.random() * 8)));

      if (count > 30) {        clearInterval(interval);
        setMyScore(finalMy);
        setOppScore(finalOpp);
        setIsFinished(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [save, opponent]);

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
        <TouchableOpacity onPress={() => handlePress(onBack)} style={globalStyles.qsBackBtn}>
          <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
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
            <TouchableOpacity style={globalStyles.qsContinueButtonTerracotta} onPress={() => handlePress(() => onFinish(result))}>
              <Text style={globalStyles.qsContinueTextBlack}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

export default QuickSimScreen;