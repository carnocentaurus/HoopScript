import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../styles/theme';

const TeamMatchupCard = ({ team }: { team: any }) => {
  const ratings = calculateTeamRatings(team.roster);

  return (
    <View style={[globalStyles.homeMatchupCard, team.isUser && globalStyles.homeUserCard]}>
      <Text style={[globalStyles.homeMatchupLogo, team.isUser ? globalStyles.homeUserLogoText : globalStyles.homeOppLogoText]}>
        {team.city.charAt(0)}
      </Text>
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
  onBackToSaves
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
  onBackToSaves: () => void
}) => {

  const isEndOfSeason = save.gamesPlayed === 82; // Adjust field name to match your state if needed
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

  return (
    <Screen>
      {/* --- SEASON & YEAR HEADER --- */}
      <View style={[globalStyles.homeSeasonHeader, globalStyles.flexRowAlignCenter]}>
        <TouchableOpacity onPress={onBackToSaves}>
           <Icon name="chevron-back" size={32} color="#B34726" />
        </TouchableOpacity>
        <View style={globalStyles.flex1} />
        <View style={globalStyles.homeYearBadge}>
          <Text style={globalStyles.homeYearText}>S{save.seasonCount} Y{save.currentYear}</Text>
        </View>
        <View style={globalStyles.flex1} />
        
        {/* RIGHT SIDE ICONS */}
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={onViewHistory}>
          <Icon name="time-outline" size={32} color="#B34726" />
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={onViewTeam}>
          <Icon name="basketball-outline" size={32} color="#B34726" />
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.qsBackBtn} onPress={onViewStandings}>
          <Icon name="podium-outline" size={32} color="#B34726" />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.homeTopNav}>
        {(save.playoffs || isEndOfSeason) && (
          <TouchableOpacity style={globalStyles.homeStandingsBtn} onPress={onViewBracket}>
            <Text style={globalStyles.homeStandingsBtnText}>PLAYOFF BRACKET</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={globalStyles.homeMainContent}>
        {(isEliminated || isChampion || missedPlayoffs) ? (
          <View style={globalStyles.homeEndSeasonContainer}>
            <Text style={globalStyles.homeEndSeasonIcon}>{isChampion ? "🏆" : "🏀"}</Text>
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
          <>
            <Text style={globalStyles.homeSectionLabelCenter}>
              {save.playoffs 
                ? getPlayoffRoundTitle(save.playoffs.round) 
                : save.gamesPlayed === 81 
                  ? "SEASON FINALE" 
                  : "UPCOMING MATCHUP"}
            </Text>
            
            <View style={globalStyles.homeMatchupWrapper}>
              <TeamMatchupCard team={LeftTeam} />
              <View style={globalStyles.homeVsContainer}>
                <Text style={[globalStyles.homeVsText, { fontSize: 12 }]}>AT</Text>
              </View>
              <TeamMatchupCard team={RightTeam} />
            </View>
            <View style={globalStyles.homeProgressSection}>
              {save.playoffs ? (
                <View style={globalStyles.homeSeriesScoreContainer}>
                  <Text style={globalStyles.homeSeriesLabel}>
                    {isSeriesCompleted ? "SERIES WON - WAITING FOR NEXT ROUND" : "BEST OF SEVEN SERIES"}
                  </Text>
                  <Text style={globalStyles.homeSeriesScoreText}>
                    {save.playoffs.myWins} — {save.playoffs.oppWins}
                  </Text>
                  <Text style={globalStyles.homeSeriesSubText}>
                    {isSeriesCompleted ? "OTHER MATCHUPS IN PROGRESS" : "FIRST TO 4 WINS ADVANCES"}
                  </Text>
                </View>
              ) : (
                <>
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
                </>
              )}
            </View>
          </>
        )}
      </View>

      {!(isEliminated || isChampion || missedPlayoffs) && (
        <TouchableOpacity 
          style={globalStyles.homeSimButton} 
          onPress={isSeriesCompleted ? onSimDay : onQuickSim}
        >
          <Text style={globalStyles.homeSimButtonText}>
            {save.playoffs 
              ? (isSeriesCompleted ? "SIMULATE ROUND DAY" : "SIMULATE PLAYOFF GAME") 
              : "QUICK SIM"}
          </Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
};

export default HomeScreen;