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
              <Text style={globalStyles.scoutModalTitle}>SCOUTING REPORT</Text>
            </View>
            
            <View style={globalStyles.scoutModalContent}>
              <Text style={globalStyles.scoutModalCity}>{opponent.city}</Text>
              {save.lastScoutReport && save.lastScoutReport.city === opponent.city ? (
                <View style={globalStyles.scoutModalReport}>
                  <View style={[globalStyles.flexRow, { justifyContent: 'space-around', marginBottom: 20, backgroundColor: COLORS.secondary, padding: 10, borderRadius: 8 }]}>
                     <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: 'Oswald' }}>COACHING PROFILE</Text>
                        <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Oswald' }}>{save.lastScoutReport.coachingProfile}</Text>
                     </View>
                     <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: 'Oswald' }}>ADJUSTMENT TENDENCY</Text>
                        <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Oswald' }}>{save.lastScoutReport.adjustmentTendency}</Text>
                     </View>
                  </View>

                  {(() => {
                    const report = save.lastScoutReport;
                    const predictability = report.predictability;
                    
                    let boxColor = '#B34726'; // Default: Orange (Uncertainty High)
                    let mainText = 'SCOUTING UNCERTAINTY HIGH';
                    let subText = 'Opponent tendencies are difficult to pin down.';

                    if (predictability > 75) {
                      boxColor = '#2D5A27'; // Green
                      mainText = 'SCOUTING LOCKED';
                      subText = 'Opponent tendencies are highly predictable.';
                    } else if (predictability >= 60) {
                      boxColor = '#D69E2E'; // Yellow/Neutral
                      mainText = 'SCOUTING DEVELOPING';
                      subText = 'Opponent tendencies are showing patterns.';
                    }

                    return (
                      <View style={{ backgroundColor: boxColor, padding: 12, borderRadius: 8, marginBottom: 15 }}>
                        <Text style={{ color: COLORS.white, fontFamily: FONTS.primary, fontSize: 13, textAlign: 'center', letterSpacing: 0.5 }}>{mainText}</Text>
                        <Text style={{ color: COLORS.white, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 14 }}>{subText}</Text>
                      </View>
                    );
                  })()}

                  <Text style={[globalStyles.scoutModalText, { marginBottom: 10, paddingHorizontal: 10 }]}>
                    {save.lastScoutReport.displayMode === 'dual' 
                      ? "Our scouts have identified two possible strategies they might employ:" 
                      : "Based on recent tendencies, our scouts expect the opponent to focus on:"}
                  </Text>

                  {save.lastScoutReport.displayMode === 'dual' && save.lastScoutReport.possibleStrategies ? (
                    <View style={{ marginBottom: 5 }}>
                      {save.lastScoutReport.possibleStrategies.map((strat, idx) => (
                        <View key={idx} style={{ backgroundColor: COLORS.grayLight, padding: 12, borderRadius: 10, marginBottom: 12, flexDirection: 'column', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                           <Text style={{ color: COLORS.textSub, fontSize: 9, fontFamily: FONTS.primary, marginBottom: 4, letterSpacing: 1 }}>POSSIBLE STRATEGY {idx === 0 ? 'A' : 'B'}</Text>
                           <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: 'Oswald' }} numberOfLines={1}>{strat.offense} / {strat.defense}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', marginBottom: 5 }}>
                      <View style={{ backgroundColor: COLORS.grayLight, paddingVertical: 30, paddingHorizontal: 20, borderRadius: 12, width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(179, 71, 38, 0.2)', minHeight: 120 }}>
                         <Text style={{ color: COLORS.primary, fontSize: 10, fontFamily: 'Oswald', letterSpacing: 2, marginBottom: 10 }}>DETECTED SCHEME</Text>
                         <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: 'Oswald', textAlign: 'center' }} numberOfLines={1}>{save.lastScoutReport.predictedOffense} / {save.lastScoutReport.predictedDefense}</Text>
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
                        return `Confidence based on your staff's analysis of their ${confidence}% predictability.`;
                      })()}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={globalStyles.scoutModalText}>No scouting data available for this game.</Text>
              )}
            </View>

            <TouchableOpacity 
              style={globalStyles.scoutModalCloseBtn}
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
