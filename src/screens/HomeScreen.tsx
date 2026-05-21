import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, OffensiveFocus, DefensiveFocus, Strategy } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings, getLeagueLeadersData } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS, FONTS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';
import { getAdjustmentLevel } from '../utils/coachingUtils';

const SeasonAwardsModal = ({ visible, standings, seasonCount, onDismiss }: { visible: boolean, standings: any[], seasonCount: number, onDismiss: () => void }) => {
  const leadersData = getLeagueLeadersData(standings, seasonCount);
  const awards = [
    { label: "MOST VALUABLE PLAYER", data: leadersData.awards.mvp[0] },
    { label: "DEFENSIVE PLAYER OF THE YEAR", data: leadersData.awards.dpoy[0] },
    { label: "SIXTH MAN OF THE YEAR", data: leadersData.awards.smoy[0] },
    { label: "ROOKIE OF THE YEAR", data: leadersData.awards.roty[0] }
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={globalStyles.modalOverlay}>
        <View style={[globalStyles.scoutModalContainer, { maxWidth: 450 }]}>
          <Text style={globalStyles.awardsModalTitle}>SEASON AWARDS</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
            {awards.map((award, idx) => {
              if (!award.data) return null;
              const logo = TEAM_LOGOS[award.data.teamCity];
              return (
                <View key={idx} style={globalStyles.awardsWinnerBlock}>
                  {logo && <Image source={logo} style={[globalStyles.llLogo, { width: 45, height: 45 }]} />}
                  <View style={globalStyles.awardsWinnerInfo}>
                    <Text style={globalStyles.awardsLabel}>{award.label}</Text>
                    <Text style={globalStyles.awardsName}>{award.data.player.lastName}</Text>
                    <Text style={globalStyles.awardsSub}>{award.data.teamCity} | {award.data.player.position}</Text>
                    <Text style={globalStyles.awardsStatLine}>
                      {award.label === "DEFENSIVE PLAYER OF THE YEAR"
                        ? `${award.data.avgs.reb} RPG / ${award.data.avgs.stl} SPG / ${award.data.avgs.blk} BPG`
                        : `${award.data.avgs.pts} PPG / ${award.data.avgs.reb} RPG / ${award.data.avgs.ast} APG`
                      }
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity 
            style={[globalStyles.scoutModalCloseBtn, { backgroundColor: COLORS.primary, marginTop: 20 }]}
            onPress={onDismiss}
          >
            <Text style={globalStyles.scoutModalCloseBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TeamMatchupCard = ({ team, onScout, onStrategy, playClickSound }: { team: any, onScout?: () => void, onStrategy?: () => void, playClickSound: () => void }) => {
  const ratings = calculateTeamRatings(team.roster);
  const logo = TEAM_LOGOS[team.city];

  return (
    <View style={[globalStyles.homeMatchupCard, team.isUser && globalStyles.homeUserCard]}>
      {!team.isUser && onScout && (
        <TouchableOpacity style={globalStyles.scoutBtn} onPress={() => { playClickSound(); onScout(); }}>
          <Icon name="eye-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      {team.isUser && onStrategy && (
        <TouchableOpacity style={globalStyles.scoutBtn} onPress={() => { playClickSound(); onStrategy(); }}>
          <Icon name="construct-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      {logo ? (
        <Image source={logo} style={globalStyles.homeMatchupLogoImage} />
      ) : (
        <Text style={[globalStyles.homeMatchupLogo, team.isUser ? globalStyles.homeUserLogoText : globalStyles.homeOppLogoText]}>
          {team.city.charAt(0)}
        </Text>
      )}
      <Text style={globalStyles.homeMatchupCity}>{team.city}</Text>
      <Text style={globalStyles.homeMatchupSub}>{team.rank} | {team.record}</Text>
      
      <View style={globalStyles.ratingsContainer}>
        <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.offense}</Text><Text style={globalStyles.ratingLabel}>OFF</Text></View>
        <View style={globalStyles.ratingBox}><Text style={globalStyles.ratingVal}>{ratings.defense}</Text><Text style={globalStyles.ratingLabel}>DEF</Text></View>
        <View style={globalStyles.ratingBox}><Text style={[globalStyles.ratingVal, globalStyles.ovrVal]}>{ratings.overall}</Text><Text style={globalStyles.ratingLabel}>OVR</Text></View>
      </View>
    </View>
  );
};

const StrategyBoard = ({ current, onUpdate }: { current: Strategy, onUpdate: (s: Strategy) => void }) => {
  const { playClickSound } = useSound();
  
  const offenses = [OffensiveFocus.ATTACK_PAINT, OffensiveFocus.PACE_SPACE, OffensiveFocus.ISO_STAR];
  const defenses = [DefensiveFocus.PROTECT_RIM, DefensiveFocus.PERIMETER_LOCK, DefensiveFocus.DOUBLE_TEAM];

  const handleSelect = (type: 'offense' | 'defense', value: any) => {
    playClickSound();
    onUpdate({ ...current, [type]: value });
  };

  return (
    <View style={[globalStyles.strategyBoardContainer, { borderWidth: 0 }]}>
      <Text style={globalStyles.strategyTitle}>Strategy Board</Text>
      
      <View style={globalStyles.strategyRow}>
        <Text style={[globalStyles.strategyLabel, { textAlign: 'center' }]}>Offensive Focus</Text>
        <View style={globalStyles.strategyOptions}>
          {offenses.map(opt => (
            <TouchableOpacity 
              key={opt} 
              style={[globalStyles.strategyOption, current.offense === opt && globalStyles.strategyOptionActive]}
              onPress={() => handleSelect('offense', opt)}
            >
              <Text style={[globalStyles.strategyOptionText, current.offense === opt && globalStyles.strategyOptionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={globalStyles.strategyRow}>
        <Text style={[globalStyles.strategyLabel, { textAlign: 'center' }]}>Defensive Focus</Text>
        <View style={globalStyles.strategyOptions}>
          {defenses.map(opt => (
            <TouchableOpacity 
              key={opt} 
              style={[globalStyles.strategyOption, current.defense === opt && globalStyles.strategyOptionActive]}
              onPress={() => handleSelect('defense', opt)}
            >
              <Text style={[globalStyles.strategyOptionText, current.defense === opt && globalStyles.strategyOptionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const HomeScreen = ({ 
  save, 
  userTeam, 
  opponent, 
  onQuickSim, 
  onSimDay,
  onViewStandings,
  onViewBracket,
  onViewHistory,
  onViewTeam,
  onBackToSaves,
  onScout,
  onUpdateStrategy,
  onViewHub,
  onDismissAwardsModal
}: { 
  save: GameSave, 
  userTeam: any, 
  opponent: any, 
  onQuickSim: (off: OffensiveFocus | null, def: DefensiveFocus | null) => void,
  onSimDay: () => void,
  onViewStandings: () => void,
  onViewBracket: () => void,
  onViewHistory: () => void,
  onViewTeam: () => void,
  onBackToSaves: () => void,
  onScout: (city: string) => void,
  onUpdateStrategy: (s: Strategy) => void,
  onViewHub: () => void,
  onDismissAwardsModal: () => void
}) => {
  const { playClickSound } = useSound();
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const isEndOfSeason = save.gamesPlayed === 82; 
  const showAwardsModal = isEndOfSeason && !save.hasSeenAwardsModal;

  const isEliminated = save.playoffs?.isEliminated;
  const isChampion = save.playoffs?.isChampion;
  const isSeriesCompleted = save.playoffs && (save.playoffs.myWins === 4 || save.playoffs.oppWins === 4);
  
  const missedPlayoffs = isEndOfSeason && !save.playoffs;

  const LeftTeam = opponent.isHome ? userTeam : opponent;
  const RightTeam = opponent.isHome ? opponent : userTeam;

  const getPlayoffRoundTitle = (round: number) => {
    if (round === 1) return "FIRST ROUND";
    if (round === 2) return "CONFERENCE SEMIFINALS";
    if (round === 3) return "CONFERENCE FINALS";
    if (round === 4) return "LEAGUE FINALS";
    return "PLAYOFFS";
  };

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  const handleScoutPress = () => {
    playClickSound();
    if (!save.lastScoutReport || save.lastScoutReport.city !== opponent.city) {
      onScout(opponent.city);
    }
    setShowScoutModal(true);
  };

  const handleSimulate = () => {
    playClickSound();
    if (save.playoffs && isSeriesCompleted) {
      onSimDay();
    } else {
      // CAPTURE SNAPSHOT: Capture what the user currently sees in the scouting report
      const expectedOff = save.lastScoutReport?.city === opponent.city ? (save.lastScoutReport?.predictedOffense ?? null) : null;
      const expectedDef = save.lastScoutReport?.city === opponent.city ? (save.lastScoutReport?.predictedDefense ?? null) : null;
      onQuickSim(expectedOff, expectedDef);
    }
  };

  return (
    <Screen>
      <SeasonAwardsModal 
        visible={showAwardsModal} 
        standings={save.standings} 
        seasonCount={save.seasonCount} 
        onDismiss={() => handlePress(onDismissAwardsModal)} 
      />

      {/* --- SEASON & YEAR HEADER --- */}
      <View style={[globalStyles.homeSeasonHeader, globalStyles.flexRowAlignCenter]}>
        <TouchableOpacity onPress={() => handlePress(onBackToSaves)}>
           <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
        <View style={globalStyles.flex1} />
        <View style={globalStyles.homeYearBadge}>
          <Text style={globalStyles.homeYearText}>S{save.seasonCount} Y{save.currentYear}</Text>
        </View>
        <View style={globalStyles.flex1} />
        
        {/* HUB ICON */}
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={() => handlePress(onViewHub)}>
          <Icon name="basketball-outline" size={32} color="#B34726" />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.homeMainContent}>
        {(isEliminated || isChampion || missedPlayoffs) ? (
          <View style={globalStyles.homeEndSeasonContainer}>
            <Text style={globalStyles.homeEndSeasonTitle}>
              {isChampion ? "LEAGUE CHAMPIONS" : "SEASON COMPLETE"}
            </Text>
            <Text style={globalStyles.homeEndSeasonSub}>
              {isChampion 
                ? "You have reached the mountain top." 
                : missedPlayoffs 
                  ? "You didn't qualify for the playoffs this year." 
                  : "Tough loss. The journey ends here."}
            </Text>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingVertical: 40 
            }}
          >
            <Text style={[globalStyles.homeSectionLabelCenter, { width: '100%' }]}>
              {save.playoffs 
                ? `${getPlayoffRoundTitle(save.playoffs.round)} - BEST OF 7` 
                : save.gamesPlayed === 81 
                  ? "SEASON FINALE" 
                  : "UPCOMING MATCHUP"}
            </Text>
            
            <View style={[globalStyles.homeMatchupWrapper, { justifyContent: 'center', width: '100%', marginBottom: 40 }]}>
              <TeamMatchupCard 
                team={LeftTeam} 
                onScout={!LeftTeam.isUser ? handleScoutPress : undefined} 
                onStrategy={LeftTeam.isUser ? () => setShowStrategyModal(true) : undefined}
                playClickSound={playClickSound}
              />
              <View style={globalStyles.homeVsContainer}>
                <Text style={[globalStyles.homeVsText, globalStyles.fs12]}>AT</Text>
              </View>
              <TeamMatchupCard 
                team={RightTeam} 
                onScout={!RightTeam.isUser ? handleScoutPress : undefined} 
                onStrategy={RightTeam.isUser ? () => setShowStrategyModal(true) : undefined}
                playClickSound={playClickSound}
              />
            </View>

            <View style={[globalStyles.homeProgressSection, { alignItems: 'center', width: '100%' }]}>
              {save.playoffs ? (
                <View style={globalStyles.homeSeriesScoreContainer}>
                  <Text style={globalStyles.homeSeriesLabel}>
                    {isSeriesCompleted ? "SERIES WON - WAITING FOR NEXT ROUND" : ""}
                  </Text>
                  <Text style={globalStyles.homeSeriesScoreText}>
                    {LeftTeam.isUser ? save.playoffs.myWins : save.playoffs.oppWins} — {RightTeam.isUser ? save.playoffs.myWins : save.playoffs.oppWins}
                  </Text>
                  <Text style={globalStyles.homeSeriesSubText}>
                    {isSeriesCompleted ? "OTHER MATCHUPS IN PROGRESS" : ""}
                  </Text>
                </View>
              ) : (
                <View style={{ width: '100%', maxWidth: 300 }}>
                  <View style={globalStyles.homeProgressInfo}>
                    <Text style={globalStyles.homeProgressLabel}>SEASON PROGRESS</Text>
                    <Text style={globalStyles.homeStatsText}>{save.gamesPlayed} / {save.totalGames}</Text>
                  </View>
                  <View style={globalStyles.homeProgressBarBg}>
                    <View 
                      style={[
                        globalStyles.homeProgressBarFill, 
                        { width: `${(save.gamesPlayed / save.totalGames) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <View style={globalStyles.homeBottomButtonsContainer}>
        {(missedPlayoffs || isEliminated || isChampion) && (
          <TouchableOpacity style={globalStyles.homeBracketButton} onPress={() => handlePress(onViewBracket)}>
            <Text style={globalStyles.homeBracketButtonText}>PLAYOFF BRACKET</Text>
          </TouchableOpacity>
        )}

        {((save.gamesPlayed < 82) || (save.playoffs && !isEliminated && !isChampion)) && (
          <TouchableOpacity 
            style={globalStyles.homeSimButton} 
            onPress={handleSimulate}
          >
            <Text style={globalStyles.homeSimButtonText}>
              {save.playoffs 
                ? (isSeriesCompleted ? "SIMULATE ROUND DAY" : "SIMULATE PLAYOFF GAME") 
                : "SIMULATE GAME"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* STRATEGY MODAL */}
      <Modal visible={showStrategyModal} transparent animationType="slide">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.scoutModalContainer}>
            <StrategyBoard current={save.currentStrategy} onUpdate={onUpdateStrategy} />
            <TouchableOpacity 
              style={globalStyles.scoutModalCloseBtn}
              onPress={() => handlePress(() => setShowStrategyModal(false))}
            >
              <Text style={globalStyles.scoutModalCloseBtnText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SCOUT REPORT MODAL */}
      <Modal visible={showScoutModal} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.scoutModalContainer}>
            <View style={[globalStyles.strategyBoardContainer, { borderWidth: 0, paddingBottom: 0 }]}>
              <Text style={globalStyles.strategyTitle}>Scouting Report</Text>
              
              {save.lastScoutReport && (
                <View style={{ 
                  alignItems: 'center', 
                  marginBottom: 20, 
                  borderWidth: 2, 
                  borderColor: getAdjustmentLevel(opponent.coachingIQ || 0).color,
                  padding: 10,
                  borderRadius: 8
                }}>
                  <Text style={[globalStyles.strategyLabel, { textAlign: 'center' }]}>Adjustment Tendency</Text>
                  <Text style={{
                    color: COLORS.white,
                    fontFamily: FONTS.primary,
                    fontSize: 14,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: 5
                  }}>
                    {getAdjustmentLevel(opponent.coachingIQ || 0).label}
                  </Text>
                </View>              )}

              {save.lastScoutReport ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ 
                    flex: 1, 
                    alignItems: 'center', 
                    borderWidth: 1, 
                    borderColor: COLORS.border, 
                    marginHorizontal: 5, 
                    padding: 10,
                    borderRadius: 8
                  }}>
                    <Text style={[globalStyles.strategyLabel, { textAlign: 'center' }]}>Offensive{"\n"}Focus</Text>
                    <Text style={[globalStyles.strategyOptionText, { fontSize: 13, marginTop: 5, color: COLORS.white }]}>
                      {save.lastScoutReport.predictedOffense}
                    </Text>
                  </View>
                  <View style={{ 
                    flex: 1, 
                    alignItems: 'center', 
                    borderWidth: 1, 
                    borderColor: COLORS.border, 
                    marginHorizontal: 5, 
                    padding: 10,
                    borderRadius: 8
                  }}>
                    <Text style={[globalStyles.strategyLabel, { textAlign: 'center' }]}>Defensive{"\n"}Focus</Text>
                    <Text style={[globalStyles.strategyOptionText, { fontSize: 13, marginTop: 5, color: COLORS.white }]}>
                      {save.lastScoutReport.predictedDefense}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={globalStyles.scoutModalText}>No scouting data available for this game.</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[globalStyles.scoutModalCloseBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => handlePress(() => setShowScoutModal(false))}
            >
              <Text style={globalStyles.scoutModalCloseBtnText}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

export default HomeScreen;
