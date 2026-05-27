import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

interface PlayoffProps {
  save: GameSave;
  onSimDay: () => void;
  onBack: () => void;
  onStartNewSeason: () => void;
  onViewFullBracket: () => void;
  onDismissFinalsMVPModal: () => void;
  isHistorical?: boolean;
}

const FinalsMVPModal = ({ visible, fmvp, onDismiss }: { visible: boolean, fmvp: any, onDismiss: () => void }) => {
  if (!fmvp) return null;
  const logo = TEAM_LOGOS[fmvp.teamCity];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={globalStyles.modalOverlay}>
        <View style={[globalStyles.scoutModalContainer, { maxWidth: 450 }]}>
          <Text style={globalStyles.awardsModalTitle}>FINALS MVP</Text>
          
          <View style={[globalStyles.awardsWinnerBlock, { borderBottomWidth: 0, alignItems: 'center' }]}>
            {logo && <Image source={logo} style={[globalStyles.llLogo, { width: 80, height: 80, marginBottom: 15 }]} />}
            <View style={[globalStyles.awardsWinnerInfo, { alignItems: 'center' }]}>
              <Text style={[globalStyles.awardsLabel, { color: COLORS.primary }]}>SERIES CHAMPION</Text>
              <Text style={[globalStyles.awardsName, { fontSize: 28 }]}>{fmvp.lastName}</Text>
              <Text style={globalStyles.awardsSub}>{fmvp.teamCity} | {fmvp.position}</Text>
              <View style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={[globalStyles.awardsStatLine, { fontSize: 18, color: COLORS.white }]}>
                  {fmvp.avgs.pts} PPG / {fmvp.avgs.reb} RPG / {fmvp.avgs.ast} APG
                </Text>
                <Text style={[globalStyles.awardsStatLine, { fontSize: 13, color: COLORS.textMuted, marginTop: 5 }]}>
                  {fmvp.avgs.stl} SPG / {fmvp.avgs.blk} BPG / {fmvp.avgs.tov} TO
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[globalStyles.scoutModalCloseBtn, { backgroundColor: COLORS.primary, marginTop: 30 }]}
            onPress={onDismiss}
          >
            <Text style={globalStyles.scoutModalCloseBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const PlayoffBracketScreen = ({ save, onSimDay, onBack, onStartNewSeason, onViewFullBracket, onDismissFinalsMVPModal, isHistorical }: PlayoffProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  // For historical views, we show the Finals (Round 4) by default
  const currentRound = isHistorical ? 4 : (save.playoffs?.round || 1);
  const roundMatchups = save.playoffBracket?.filter(s => s.round === currentRound) || [];
  
  // Check if the Finals (Round 4) are completed
  const isFinalsOver = currentRound === 4 && roundMatchups.length > 0 && roundMatchups[0].isCompleted;

  const showFinalsMVP = isFinalsOver && !save.hasSeenFinalsMVPModal && !!save.finalsMVP;

  const getRank = (city: string) => {
    const team = save.standings.find(t => t.city === city);
    if (!team) return "";
    
    const confTeams = save.standings
      .filter(t => t.conf === team.conf)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
      
    const index = confTeams.findIndex(t => t.city === city);
    return (index + 1).toString();
  };

  const renderConferenceSection = (conf: 'East' | 'West' | 'Finals') => {
    const matchups = roundMatchups.filter(m => m.conference === conf);
    if (matchups.length === 0) return null;

    return (
      <View key={conf} style={globalStyles.pbConferenceSection}>
        <Text style={globalStyles.pbConferenceHeader}>
          {conf === 'Finals' ? 'LEAGUE FINALS' : `${conf.toUpperCase()}ERN CONFERENCE`}
        </Text>
        {matchups.map((series) => {
          const highLogo = TEAM_LOGOS[series.highSeed];
          const lowLogo = TEAM_LOGOS[series.lowSeed];
          
          return (
            <View key={series.id} style={globalStyles.pbSeriesCard}>
              <View style={globalStyles.pbTeamRow}>
                <View style={globalStyles.pbTeamInfo}>
                  <Text style={globalStyles.pbRankLabel}>{getRank(series.highSeed)}</Text>
                  {highLogo && <Image source={highLogo} style={globalStyles.pbLogoImage} />}
                  <Text style={[globalStyles.pbTeamName, series.highSeedWins === 4 && globalStyles.textTerracotta]}>
                    {series.highSeed}
                  </Text>
                </View>
                <Text style={[globalStyles.pbScore, series.highSeedWins === 4 && globalStyles.textTerracotta]}>
                  {series.highSeedWins}
                </Text>
              </View>

              <View style={globalStyles.pbTeamRow}>
                <View style={globalStyles.pbTeamInfo}>
                  <Text style={globalStyles.pbRankLabel}>{getRank(series.lowSeed)}</Text>
                  {lowLogo && <Image source={lowLogo} style={globalStyles.pbLogoImage} />}
                  <Text style={[globalStyles.pbTeamName, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                    {series.lowSeed}
                  </Text>
                </View>
                <Text style={[globalStyles.pbScore, series.lowSeedWins === 4 && globalStyles.textTerracotta]}>
                  {series.lowSeedWins}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const isSeriesCompleted = save.playoffs && (save.playoffs.myWins === 4 || save.playoffs.oppWins === 4);

  return (
    <Screen>
      <FinalsMVPModal 
        visible={showFinalsMVP} 
        fmvp={save.finalsMVP} 
        onDismiss={() => handlePress(onDismissFinalsMVPModal)} 
      />
      <View style={globalStyles.pbHeader}>
        <TouchableOpacity onPress={() => handlePress(onBack)}>
          <Icon name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={globalStyles.pbTitle}>{isFinalsOver ? "FINALS COMPLETE" : `ROUND ${currentRound}`}</Text>
        <View style={globalStyles.headerSpacer} />
      </View>

      <ScrollView style={globalStyles.pbContent}>
        {renderConferenceSection('East')}
        {renderConferenceSection('West')}
        {renderConferenceSection('Finals')}
        
        {isFinalsOver && (
          <View style={globalStyles.pbChampContainer}>
            <Image source={require('../../assets/images/trophy.webp')} style={{ width: 160, height: 160, resizeMode: 'contain', marginBottom: 30 }} />
            <Text style={globalStyles.pbChampText}>
              CHAMPIONS: {(roundMatchups[0].highSeedWins === 4 ? roundMatchups[0].highSeed : roundMatchups[0].lowSeed).toUpperCase()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Button Logic: Show "Full Bracket" and "Start New Season" if Finals are over, otherwise "Simulate Day" */}
      {isFinalsOver ? (
        <>
          <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.bgTerracotta, globalStyles.mb10]} onPress={() => handlePress(onViewFullBracket)}>
            <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>FULL BRACKET</Text>
          </TouchableOpacity>
          {!isHistorical && (
            <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.pbNextSeasonBtn, globalStyles.bgTerracotta]} onPress={() => handlePress(onStartNewSeason)}>
              <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>START NEW SEASON</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        !isHistorical && (save.playoffs?.isEliminated || isSeriesCompleted) && (
          <TouchableOpacity style={[globalStyles.pbSimDayBtn, globalStyles.bgTerracotta]} onPress={() => handlePress(onSimDay)}>
            <Text style={[globalStyles.pbSimDayBtnText, globalStyles.textBlackBold]}>SIMULATE DAY</Text>
          </TouchableOpacity>
        )
      )}
    </Screen>
  );
};

export default PlayoffBracketScreen;