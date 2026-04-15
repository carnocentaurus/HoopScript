import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { calculateTeamRatings } from '../utils/leagueEngine';

const TeamMatchupCard = ({ team }: { team: any }) => {
  const ratings = calculateTeamRatings(team.roster);

  return (
    <View style={[styles.matchupCard, team.isUser && styles.userCard]}>
      {team.isUser && (
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>YOUR TEAM</Text>
        </View>
      )}
      <Text style={[styles.matchupLogo, team.isUser ? styles.userLogoText : styles.oppLogoText]}>
        {team.city.charAt(0)}
      </Text>
      <Text style={styles.matchupCity}>{team.city}</Text>
      <Text style={styles.matchupSub}>{team.rank} | {team.record}</Text>
      
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.offense}</Text><Text style={styles.ratingLabel}>OFF</Text></View>
        <View style={styles.ratingBox}><Text style={styles.ratingVal}>{ratings.defense}</Text><Text style={styles.ratingLabel}>DEF</Text></View>
        <View style={styles.ratingBox}><Text style={[styles.ratingVal, styles.ovrVal]}>{ratings.overall}</Text><Text style={styles.ratingLabel}>OVR</Text></View>
      </View>

      <View style={[styles.venueBadge, team.isHome ? styles.homeBadge : styles.awayBadge]}>
        <Text style={styles.venueText}>{team.isHome ? "HOME" : "AWAY"}</Text>
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
      <View style={styles.seasonHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToSaves}>
           <Text style={styles.backBtnText}>SWITCH SAVE</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>S{save.seasonCount} Y{save.currentYear}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.historyBtn} onPress={onViewHistory}>
           <Text style={styles.historyBtnText}>HISTORY</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topNav}>
        <TouchableOpacity style={[styles.standingsBtn, { marginRight: 8 }]} onPress={onViewTeam}>
          <Text style={styles.standingsBtnText}>TEAM OVERVIEW</Text>
        </TouchableOpacity>

        {(save.playoffs || isEndOfSeason) && (
          <TouchableOpacity style={[styles.standingsBtn, { marginRight: 8 }]} onPress={onViewBracket}>
            <Text style={styles.standingsBtnText}>PLAYOFF BRACKET</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.standingsBtn} onPress={onViewStandings}>
          <Text style={styles.standingsBtnText}>
            {isEndOfSeason ? "FINAL STANDINGS" : "LEAGUE STANDINGS"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {(isEliminated || isChampion || missedPlayoffs) ? (
          <View style={styles.endSeasonContainer}>
            <Text style={styles.endSeasonIcon}>{isChampion ? "🏆" : "🏀"}</Text>
            <Text style={styles.endSeasonTitle}>
              {isChampion ? "LEAGUE CHAMPIONS" : "SEASON COMPLETE"}
            </Text>
            <Text style={styles.endSeasonSub}>
              {isChampion 
                ? "You have reached the mountain top." 
                : missedPlayoffs 
                  ? "You didn't qualify for the playoffs this year." 
                  : "Tough loss. The journey ends here."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabelCenter}>
              {save.playoffs 
                ? getPlayoffRoundTitle(save.playoffs.round) 
                : save.gamesPlayed === 81 
                  ? "SEASON FINALE" 
                  : "UPCOMING MATCHUP"}
            </Text>
            
            <View style={styles.matchupWrapper}>
              <TeamMatchupCard team={LeftTeam} />
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>AT</Text>
              </View>
              <TeamMatchupCard team={RightTeam} />
            </View>

            <View style={styles.progressSection}>
              {save.playoffs ? (
                <View style={styles.seriesScoreContainer}>
                  <Text style={styles.seriesLabel}>
                    {isSeriesCompleted ? "SERIES WON - WAITING FOR NEXT ROUND" : "BEST OF SEVEN SERIES"}
                  </Text>
                  <Text style={styles.seriesScoreText}>
                    {save.playoffs.myWins} — {save.playoffs.oppWins}
                  </Text>
                  <Text style={styles.seriesSubText}>
                    {isSeriesCompleted ? "OTHER MATCHUPS IN PROGRESS" : "FIRST TO 4 WINS ADVANCES"}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>SEASON PROGRESS</Text>
                    <Text style={styles.statsText}>{save.gamesPlayed} / {save.totalGames}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
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
          style={styles.simButton} 
          onPress={isSeriesCompleted ? onSimDay : onQuickSim}
        >
          <Text style={styles.simButtonText}>
            {save.playoffs 
              ? (isSeriesCompleted ? "SIMULATE ROUND DAY" : "SIMULATE PLAYOFF GAME") 
              : "SIMULATE NEXT GAME"}
          </Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  // --- NEW STYLES ---
  seasonHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    flexDirection: 'row',
  },
  yearBadge: {
    backgroundColor: '#2D3748',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#C41E3A', // Historical red accent
  },
  yearText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  backBtn: {
    backgroundColor: '#1A202C',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  backBtnText: {
    color: '#A0AEC0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  historyBtn: {
    backgroundColor: '#1A202C',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  historyBtnText: {
    color: '#A0AEC0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ratingsContainer: { flexDirection: 'row', gap: 15, marginTop: 10 },
  ratingBox: { alignItems: 'center' },
  ratingVal: { fontSize: 13, fontWeight: '900', color: '#2D3748' },
  ovrVal: { color: '#4A90E2' },
  ratingLabel: { fontSize: 8, color: '#A0AEC0', fontWeight: 'bold' },

  // --- EXISTING STYLES ---
  topNav: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 10 },
  standingsBtn: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#FFF', borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  standingsBtnText: { fontSize: 10, fontWeight: '800', color: '#66788A', letterSpacing: 1 },
  
  mainContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  sectionLabelCenter: { color: '#A0AEC0', fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginBottom: 25 },
  
  matchupWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchupCard: { 
    flex: 1, backgroundColor: '#FFF', paddingVertical: 30, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, position: 'relative', borderWidth: 2, borderColor: 'transparent' 
  },
  userCard: { borderColor: '#4A90E2' },
  userBadge: { position: 'absolute', top: -10, backgroundColor: '#4A90E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  userBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  
  matchupLogo: { fontSize: 42, fontWeight: '900', marginBottom: 12 },
  userLogoText: { color: '#2D3748' },
  oppLogoText: { color: '#CBD5E0' },
  matchupCity: { fontSize: 16, fontWeight: '800', color: '#2D3748', textTransform: 'uppercase' },
  matchupSub: { color: '#718096', fontSize: 11, marginTop: 4, fontWeight: '600' },
  
  venueBadge: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  homeBadge: { backgroundColor: '#EBF4FF' },
  awayBadge: { backgroundColor: '#F7FAFC' },
  venueText: { fontSize: 10, fontWeight: '800', color: '#4A90E2', letterSpacing: 0.5 },

  vsContainer: { width: 40, alignItems: 'center' },
  vsText: { color: '#CBD5E0', fontWeight: '900', fontSize: 16 },

  progressSection: { marginTop: 60, paddingHorizontal: 20, minHeight: 80, justifyContent: 'center' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' },
  progressLabel: { color: '#718096', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4A90E2' },
  statsText: { color: '#2D3748', fontSize: 14, fontWeight: '800' },

  seriesScoreContainer: { alignItems: 'center' },
  seriesLabel: { color: '#A0AEC0', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  seriesScoreText: { color: '#2D3748', fontSize: 32, fontWeight: '900', letterSpacing: 10 },
  seriesSubText: { color: '#718096', fontSize: 10, fontWeight: '700', marginTop: 8 },

  endSeasonContainer: { alignItems: 'center', padding: 20 },
  endSeasonIcon: { fontSize: 64, marginBottom: 20 },
  endSeasonTitle: { fontSize: 22, fontWeight: '900', color: '#2D3748', textAlign: 'center' },
  endSeasonSub: { fontSize: 14, color: '#718096', textAlign: 'center', marginTop: 10, lineHeight: 20 },

  simButton: { backgroundColor: '#2D3748', margin: 20, padding: 20, borderRadius: 16, alignItems: 'center', position: 'absolute', bottom: 40, left: 0, right: 0, elevation: 8 },
  simButtonText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});

export default HomeScreen;