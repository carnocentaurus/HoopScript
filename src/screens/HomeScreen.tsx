import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave, OffensiveFocus, DefensiveFocus, Strategy } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS, FONTS } from '../styles/theme';
import { TEAM_LOGOS } from '../data/teams';
import { useSound } from '../hooks/useSound';

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
        <Text style={globalStyles.strategyLabel}>Offensive Focus</Text>
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
        <Text style={globalStyles.strategyLabel}>Defensive Focus</Text>
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
  onUpdateStrategy
}: { 
  save: GameSave, 
  userTeam: any, 
  opponent: any, 
  onQuickSim: () => void,
  onSimDay: () => void,
  onViewStandings: () => void,
  onViewBracket: () => void,
  onViewHistory: () => void,
  onViewTeam: () => void,
  onBackToSaves: () => void,
  onScout: (city: string) => void,
  onUpdateStrategy: (s: Strategy) => void
}) => {
  const { playClickSound } = useSound();
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const isEndOfSeason = save.gamesPlayed === 82; 
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

  return (
    <Screen>
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
        
        {/* RIGHT SIDE ICONS */}
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={() => handlePress(onViewHistory)}>
          <Icon name="time-outline" size={32} color="#B34726" />
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={() => handlePress(onViewTeam)}>
          <Icon name="people-outline" size={32} color="#B34726" />
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={() => handlePress(onViewStandings)}>
          <Icon name="podium-outline" size={32} color="#B34726" />
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
            onPress={() => handlePress(save.playoffs && isSeriesCompleted ? onSimDay : onQuickSim)}
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
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[globalStyles.scoutModalTitle, { color: COLORS.orange }]}>SCOUTING REPORT</Text>
            </View>
            
            <View style={globalStyles.scoutModalContent}>
              <Text style={globalStyles.scoutModalCity}>{opponent.city}</Text>
              {save.lastScoutReport && save.lastScoutReport.city === opponent.city ? (
                <View style={globalStyles.scoutModalReport}>
                  <View style={globalStyles.scoutChipRow}>
                    <View style={globalStyles.scoutChip}>
                      <Text style={globalStyles.scoutChipLabel}>COACHING PROFILE</Text>
                      <Text style={globalStyles.scoutChipValue}>{save.lastScoutReport.coachingProfile}</Text>
                    </View>
                    <View style={globalStyles.scoutChip}>
                      <Text style={globalStyles.scoutChipLabel}>ADJUSTMENT</Text>
                      <Text style={globalStyles.scoutChipValue}>{save.lastScoutReport.adjustmentTendency}</Text>
                    </View>
                  </View>

                  {(() => {
                    const report = save.lastScoutReport;
                    const predictability = report.predictability;
                    
                    let borderColor = COLORS.primary; 
                    let mainText = 'SCOUTING UNCERTAINTY HIGH';
                    let subText = 'Opponent tendencies are difficult to pin down.';
                    let iconName = "alert-circle-outline";

                    if (predictability > 75) {
                      borderColor = COLORS.success;
                      mainText = 'SCOUTING LOCKED';
                      subText = 'Opponent tendencies are highly predictable.';
                      iconName = "checkmark-circle-outline";
                    } else if (predictability >= 60) {
                      borderColor = COLORS.warning;
                      mainText = 'SCOUTING DEVELOPING';
                      subText = 'Opponent tendencies are showing patterns.';
                      iconName = "pulse-outline";
                    }

                    return (
                      <View style={[globalStyles.scoutStatusBox, { borderColor }]}>
                        <Icon name={iconName as any} size={18} color={borderColor} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={globalStyles.scoutStatusText}>{mainText}</Text>
                          <Text style={globalStyles.scoutStatusSubText}>{subText}</Text>
                        </View>
                      </View>
                    );
                  })()}

                  <Text style={[globalStyles.scoutModalText, { marginBottom: 15, paddingHorizontal: 10, fontSize: 12 }]}>
                    {save.lastScoutReport.displayMode === 'dual' 
                      ? "Our scouts have identified two possible strategies they might employ:" 
                      : "Based on recent tendencies, our scouts expect the opponent to focus on:"}
                  </Text>

                  {save.lastScoutReport.displayMode === 'dual' && save.lastScoutReport.possibleStrategies ? (
                    <View style={{ marginBottom: 10, gap: 16 }}>
                      {save.lastScoutReport.possibleStrategies.map((strat, idx) => (
                        <View key={idx} style={[globalStyles.scoutStrategyCard, globalStyles.scoutStrategyAccent]}>
                           <Text style={globalStyles.scoutStrategyHeader}>POSSIBLE STRATEGY {idx === 0 ? 'A' : 'B'}</Text>
                           <Text style={globalStyles.scoutStrategyValue} numberOfLines={1}>{strat.offense} / {strat.defense}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                      <View style={[globalStyles.scoutStrategyCard, { paddingVertical: 30, paddingHorizontal: 20, width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}>
                         <Text style={[globalStyles.scoutStrategyHeader, { color: COLORS.orange, fontSize: 10, letterSpacing: 2, marginBottom: 10 }]}>DETECTED SCHEME</Text>
                         <Text style={[globalStyles.scoutStrategyValue, { fontSize: 16, textAlign: 'center' }]} numberOfLines={1}>{save.lastScoutReport.predictedOffense} / {save.lastScoutReport.predictedDefense}</Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={{ paddingHorizontal: 5 }}>
                    <Text style={[globalStyles.scoutModalText, { fontSize: 10, marginTop: 8, opacity: 0.6, lineHeight: 12 }]}>
                      {(() => {
                        const report = save.lastScoutReport;
                        if (report.predictability > 75) {
                          return "Our scouts are highly confident in this specific read.";
                        }
                        
                        const strats = report.possibleStrategies;
                        const isUnique = report.displayMode === 'single' || (strats && strats.length > 1 && 
                          (strats[0].offense !== strats[1].offense || strats[0].defense !== strats[1].defense));
                        
                        const confidence = isUnique ? report.predictability : Math.floor(report.predictability * 0.7);
                        return (
                          <Text>
                            Confidence based on staff analysis of their <Text style={globalStyles.scoutPredictabilityMonospace}>{confidence}%</Text> predictability.
                          </Text>
                        );
                      })()}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={globalStyles.scoutModalText}>No scouting data available for this game.</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[globalStyles.scoutModalCloseBtn, { backgroundColor: COLORS.orange }]}
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
