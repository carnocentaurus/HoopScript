import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSave, SeriesMatchup, Player, TeamStanding } from '../types/save';
import { validateAndFixRoster, clearNameRegistry, registerName, generateUniqueName, migrateSaveNames } from '../utils/rosterGenerator';
import { GameResult, generatePlayerStats, COUNTER_MATRIX, simulateLeagueDay } from '../utils/gameSim';
import { randomNormal } from '../utils/statsMath';
import { 
  ALL_CITIES, 
  generateSchedule, 
  generateInitialStandings, 
  updatePlayerStats, 
  processAging, 
  generateDraftOrder, 
  generateDraftPool,
  generateFullBracket,
  calculateRank,
  getHighSeedWinProb,
  getTeamStrength,
  trimRosters,
  selectCPUStrategy,
  generateScoutReport,
  initializeNewLeague,
  calculateFinalsMVP,
  resetFinalsStats,
  getLeagueLeadersData,
  getTeamLeadersData,
  getPlayoffOpponentStrategy,
  determineFinalsHomeCourt
} from '../utils/leagueEngine';
import { generateCoachingIQ } from '../utils/coachingUtils';

import { useSound } from './useSound';
import { OffensiveFocus, DefensiveFocus, Strategy, ScoutReport } from '../types/save';

const STORAGE_KEY = '@hoopscript_saves';

export type ViewState = 'loading' | 'saveSelection' | 'yearSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings' | 'bracket' | 'fullBracket' | 'history' | 'myTeamOverview' | 'lottery' | 'draft' | 'credits' | 'leagueLeaders' | 'leagueHub';

export const useGameState = () => {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);
  const [selectedTeamCity, setSelectedTeamCity] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isTimerDone, setIsTimerDone] = useState(false);
  const { playClickSound } = useSound();

  useEffect(() => {
    const loadSaves = async () => {
      try {
        const storedSaves = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSaves) {
          const parsed = JSON.parse(storedSaves);
          let needsReSave = false;

          const migrated = parsed.map((s: any) => {
            if (!s) return null;

            // Integrity Check: Reset corrupted saves
            const isCorrupted = !s.city || !s.roster || !s.standings;
            if (isCorrupted) {
              console.warn("Detected corrupted save, resetting slot.");
              return null;
            }

            // Culture-aware Name Migration (Version 3.0)
            if (!s.version || s.version < 3.0) {
              s = migrateSaveNames(s);
              s.version = 3.0;
              needsReSave = true;
            }

            const migrateRoster = (r: any[]) => r.map((p: any) => ({
              ...p,
              usgRate: p.usgRate ?? (p.isStarter ? 25 : 18),
              tsPct: p.tsPct ?? 0.55,
              blkRate: p.blkRate ?? 1.2,
              stlRate: p.stlRate ?? 1.5,
              tovRate: p.tovRate ?? 12,
              stats: {
                ...p.stats,
                threePA: p.stats.threePA ?? Math.round((p.stats.threePM || 0) * 2.8),
                possessions: p.stats.possessions ?? ((p.stats.gamesPlayed || 0) * 75)
              }
            }));

            return {
              ...s,
              coachingIQ: s.coachingIQ ?? 60,
              predictability: s.predictability ?? 60,
              currentStrategy: s.currentStrategy ?? {
                offense: OffensiveFocus.ATTACK_PAINT,
                defense: DefensiveFocus.PROTECT_RIM
              },
              roster: migrateRoster(s.roster || []),
              standings: s.standings?.map((t: any) => ({
                ...t,
                coachingIQ: t.coachingIQ ?? generateCoachingIQ(),
                predictability: t.predictability ?? (Math.floor(Math.random() * 51) + 40),
                streak: t.streak ?? 0,
                pace: t.pace ?? 100,
                roster: migrateRoster(t.roster || [])
              }))
            };
          });

          if (needsReSave) {
            try {
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
              setSaves(migrated);
            } catch (err) {
              console.error("Atomic Migration Failed, rolling back in-memory state", err);
              // If write fails, we don't update the in-memory state to the migrated one
              // but we should still load the original (or whatever was parsed)
              setSaves(parsed); 
            }
          } else {
            setSaves(migrated);
          }
        }
      } catch (e) {
        console.error("Failed to load saves", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };
    loadSaves();
    const timer = setTimeout(() => setIsTimerDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isStorageLoaded && isTimerDone) setView('saveSelection');
  }, [isStorageLoaded, isTimerDone]);

  const persistSaves = async (newSaves: (GameSave | null)[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const handleDeleteSlot = (slotId: number) => {
    const updatedSaves = [...saves];
    const targetSave = updatedSaves[slotId - 1];
    if (!targetSave) return;

    Alert.alert(
      "Reset Save",
      `Are you sure you want to reset SAVE ${slotId} (${targetSave.city})? All progress will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            playClickSound();
            updatedSaves[slotId - 1] = null;
            setSaves(updatedSaves);
            persistSaves(updatedSaves);
          }
        }
      ]
    );
  };

  const populateNameRegistry = (save: GameSave) => {
    clearNameRegistry();
    save.standings.forEach(team => {
      team.roster.forEach(p => registerName(p.lastName));
    });
    if (save.draftState?.pool) {
      save.draftState.pool.forEach(p => registerName(p.lastName));
    }
  };

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    const save = saves[slotId - 1];
    if (save) {
      populateNameRegistry(save);
      setView((save.lastView as ViewState) || 'home');
    } else {
      setView('yearSelection');
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setView('teamSelection');
  };

  const handleTeamSelect = (city: string) => {
    setTempCity(city);
    setView('teamOverview');
  };

  const handleConfirmTeam = () => {
    if (!tempCity || activeSlot === null) return;
    const initialStandings = initializeNewLeague();
    const userTeamData = initialStandings.find(t => t.city === tempCity);
    const { opponents, homeStatuses } = generateSchedule(tempCity);

    const newSave: GameSave = {
      id: Date.now().toString(),
      version: 3.0,
      name: `My GM Career - ${tempCity}`,
      slotId: activeSlot,
      city: tempCity,
      wins: 0, losses: 0, gamesPlayed: 0, totalGames: 82, rank: 15,
      conference: (ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West'),
      roster: userTeamData?.roster || [], 
      schedule: opponents,
      scheduleHomeStatus: homeStatuses,
      standings: initialStandings, 
      playoffs: null, playoffBracket: null, history: [], leagueHistory: [],
      startYear: selectedYear, currentYear: selectedYear, seasonCount: 1,
      lastView: 'home',
      coachingIQ: 60,
      predictability: 60,
      currentStrategy: {
        offense: OffensiveFocus.ATTACK_PAINT,
        defense: DefensiveFocus.PROTECT_RIM
      },
      lastScoutReport: null,
      hasSeenAwardsModal: false
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    saveAndSet(newSaves, 'home');
  };

  const handleScout = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    const oppCity = currentSave.playoffs 
      ? currentSave.playoffs.opponentCity 
      : currentSave.schedule[currentSave.gamesPlayed];
    
    // During regular season, only generate a new report if we don't already have one for this specific opponent
    // During playoffs, we ALWAYS allow re-scouting if the game number has changed to capture tactical shifts
    if (!currentSave.playoffs && currentSave.lastScoutReport && currentSave.lastScoutReport.city === oppCity) {
      return;
    }

    // Playoff-specific check: if we already scouted THIS specific game in the series, skip
    if (currentSave.playoffs) {
      const currentGameNum = (currentSave.playoffs.myWins + currentSave.playoffs.oppWins) + 1;
      if (currentSave.lastScoutReport && 
          currentSave.lastScoutReport.city === oppCity && 
          (currentSave.lastScoutReport as any).gameNum === currentGameNum) {
        return;
      }
    }

    const oppTeam = currentSave.standings.find(t => t.city === oppCity);
    const myTeam = currentSave.standings.find(t => t.city === currentSave.city);

    if (!oppTeam || !myTeam) return;

    // We pass the context to selectCPUStrategy to see what they are LIKELY to do
    let oppStrategy: Strategy;
    let currentGameNum = 1;
    if (currentSave.playoffs) {
      currentGameNum = (currentSave.playoffs.myWins + currentSave.playoffs.oppWins) + 1;
      oppStrategy = getPlayoffOpponentStrategy(oppTeam, myTeam, currentGameNum, currentSave.currentStrategy);
    } else {
      oppStrategy = selectCPUStrategy(oppTeam, myTeam, false);
    }

    const report = generateScoutReport(oppStrategy, oppTeam.coachingIQ ?? 60, oppTeam.predictability ?? 60);
    report.city = oppCity;
    report.actualStrategy = oppStrategy;
    (report as any).gameNum = currentGameNum; // Attach game number to track uniqueness in playoffs

    currentSave.lastScoutReport = report;
    saveAndSet(updatedSaves, view);
  };

  const handleUpdateStrategy = (strategy: Strategy) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    currentSave.currentStrategy = strategy;
    saveAndSet(updatedSaves, view);
  };

  const handleGameFinish = (result: GameResult) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    if (currentSave.playoffs) {
      const isUserWin = result.myScore > result.oppScore;
      const opponentCity = currentSave.playoffs.opponentCity;
      const isFinals = currentSave.playoffs.round === 4;

      // Update User Roster
      currentSave.roster = currentSave.roster.map(p => {
        const pStat = result.myTeamStats.find(s => s.playerId === p.id);
        return pStat ? updatePlayerStats(p, pStat, isFinals) : p;
      });

      // Update Opponent Roster
      const oppTeam = currentSave.standings.find(t => t.city === opponentCity);
      if (oppTeam) oppTeam.roster = oppTeam.roster.map(p => {
        const pStat = result.oppTeamStats.find(s => s.playerId === p.id);
        return pStat ? updatePlayerStats(p, pStat, isFinals) : p;
      });

      const userSeriesId = currentSave.playoffBracket?.find((s: SeriesMatchup) => 
        (s.highSeed === currentSave.city || s.lowSeed === currentSave.city) && s.round === currentSave.playoffs!.round
      )?.id;

      // Simulate ALL playoff games for this "day" (one game per series)
      const playoffResults = simulateLeagueDay(currentSave.standings, currentSave.city, opponentCity, true, isFinals);

      currentSave.playoffBracket = currentSave.playoffBracket?.map((series: SeriesMatchup) => {
        if (series.isCompleted || series.round !== currentSave.playoffs!.round) return series;
        
        let highWon = false;
        if (series.id === userSeriesId) {
          const isUserHigh = series.highSeed === currentSave.city;
          highWon = isUserHigh ? isUserWin : !isUserWin;
          if (isUserWin) currentSave.playoffs!.myWins += 1;
          else currentSave.playoffs!.oppWins += 1;
        } else {
          // AI Series
          const resHigh = playoffResults[series.highSeed];
          highWon = resHigh === 'W';
        }

        if (highWon) series.highSeedWins += 1;
        else series.lowSeedWins += 1;
        if (series.highSeedWins === 4 || series.lowSeedWins === 4) series.isCompleted = true;
        return series;
      }) || null;

      const mySeries = currentSave.playoffBracket?.find((s: SeriesMatchup) => s.id === userSeriesId);
      if (mySeries?.isCompleted) {
         const won = (mySeries.highSeed === currentSave.city && mySeries.highSeedWins === 4) || (mySeries.lowSeed === currentSave.city && mySeries.lowSeedWins === 4);
         if (!won) currentSave.playoffs.isEliminated = true;
      }
      checkAndAdvancePlayoffRound(currentSave);
    } else {
      // ... regular season logic (unchanged internally)
      const isWin = result.myScore > result.oppScore;
      const opponentCity = currentSave.schedule[currentSave.gamesPlayed];
      currentSave.wins += isWin ? 1 : 0;
      currentSave.losses += isWin ? 0 : 1;

      currentSave.roster = currentSave.roster.map(p => {
        const pStat = result.myTeamStats.find(s => s.playerId === p.id);
        return pStat ? updatePlayerStats(p, pStat) : p;
      });

      // Update user team in standings to keep rosters in sync
      const userTeamInStandings = currentSave.standings.find(t => t.city === currentSave.city);
      if (userTeamInStandings) {
        userTeamInStandings.roster = currentSave.roster;
      }

      const aiTeams = currentSave.standings.filter(t => t.city !== currentSave.city && t.city !== opponentCity);
      const todayResults: Record<string, 'W' | 'L'> = { [currentSave.city]: isWin ? 'W' : 'L', [opponentCity]: isWin ? 'L' : 'W' };

      const dayResults = simulateLeagueDay(currentSave.standings, currentSave.city, opponentCity);
      Object.assign(todayResults, dayResults);

      const oppTeam = currentSave.standings.find(t => t.city === opponentCity);
      if (oppTeam) oppTeam.roster = oppTeam.roster.map(p => {
        const pStat = result.oppTeamStats.find(s => s.playerId === p.id);
        return pStat ? updatePlayerStats(p, pStat) : p;
      });

      currentSave.standings = currentSave.standings.map(team => {
        const res = todayResults[team.city];
        const isWin = res === 'W';
        
        let newStreak = team.streak || 0;
        if (isWin) {
          newStreak = newStreak > 0 ? newStreak + 1 : 1;
        } else {
          newStreak = newStreak < 0 ? newStreak - 1 : -1;
        }

        let totalPoints = team.totalPoints || 0;
        let gamesPlayed = team.gamesPlayed || 0;

        if (team.city === currentSave.city) {
          totalPoints += result.myScore;
          gamesPlayed += 1;
        } else if (team.city === opponentCity) {
          totalPoints += result.oppScore;
          gamesPlayed += 1;
        }

        // Update L10 (Last 10 Games)
        const updatedRecentResults = [...(team.recentResults || [])];
        updatedRecentResults.push(isWin ? 'W' : 'L');
        if (updatedRecentResults.length > 10) {
          updatedRecentResults.shift();
        }

        return { 
          ...team, 
          wins: team.wins + (isWin ? 1 : 0), 
          losses: team.losses + (!isWin ? 1 : 0),
          streak: newStreak,
          totalPoints,
          gamesPlayed,
          recentResults: updatedRecentResults
        };
      });

      currentSave.gamesPlayed += 1;
      if (currentSave.gamesPlayed === 82) {
        const bracket = generateFullBracket(currentSave);
        currentSave.playoffBracket = bracket;
        const userSeries = bracket.find(s => s.highSeed === currentSave.city || s.lowSeed === currentSave.city);
        currentSave.playoffs = {
          round: 1,
          opponentCity: userSeries ? (userSeries.highSeed === currentSave.city ? userSeries.lowSeed : userSeries.highSeed) : "NONE",
          myWins: 0, oppWins: 0, isEliminated: !userSeries, isChampion: false,
        };
      }
    }
    saveAndSet(updatedSaves, 'home'); 
  };

  const checkAndAdvancePlayoffRound = (currentSave: GameSave) => {
    if (!currentSave.playoffs || !currentSave.playoffBracket) return;
    const currentRound = currentSave.playoffs.round;
    const roundSeries = currentSave.playoffBracket.filter(s => s.round === currentRound);
    if (roundSeries.every(s => s.isCompleted)) {
      if (currentRound < 4) {
        const nextRound = currentRound + 1;
        
        // Reset Finals Stats if we are entering the finals
        if (nextRound === 4) {
          resetFinalsStats(currentSave.standings);
        }

        const winners = roundSeries.map(s => (s.highSeedWins === 4 ? s.highSeed : s.lowSeed));
        const nextMatches: SeriesMatchup[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          const cityA = winners[i]; const cityB = winners[i + 1];
          let isAFinishedHigh = false;
          
          if (nextRound === 4) {
            // Finals Home-Court Advantage Logic
            const teamA = currentSave.standings.find(t => t.city === cityA)!;
            const teamB = currentSave.standings.find(t => t.city === cityB)!;
            const homeCourtTeam = determineFinalsHomeCourt(teamA, teamB, currentSave.standings);
            isAFinishedHigh = (homeCourtTeam.city === cityA);
          } else {
            // Regular Conference Playoff Seeding
            const rankA = parseInt(calculateRank(cityA, currentSave.standings));
            const rankB = parseInt(calculateRank(cityB, currentSave.standings));
            isAFinishedHigh = rankA < rankB;
          }

          nextMatches.push({
            id: `R${nextRound}-${i}`, round: nextRound,
            highSeed: isAFinishedHigh ? cityA : cityB, lowSeed: isAFinishedHigh ? cityB : cityA,
            highSeedWins: 0, lowSeedWins: 0, isCompleted: false,
            conference: currentRound === 3 ? 'Finals' : roundSeries[i].conference,
          });
        }
        currentSave.playoffBracket = [...currentSave.playoffBracket, ...nextMatches];
        const userSeries = nextMatches.find(s => s.highSeed === currentSave.city || s.lowSeed === currentSave.city);
        if (userSeries) {
          currentSave.playoffs.round = nextRound;
          currentSave.playoffs.opponentCity = userSeries.highSeed === currentSave.city ? userSeries.lowSeed : userSeries.highSeed;
          currentSave.playoffs.myWins = 0; currentSave.playoffs.oppWins = 0;
        } else currentSave.playoffs.round = nextRound;
      } else {
        const lastSeries = roundSeries[0];
        const champion = lastSeries.highSeedWins === 4 ? lastSeries.highSeed : lastSeries.lowSeed;
        currentSave.playoffs.isChampion = (champion === currentSave.city);
        
        // Calculate Finals MVP
        const champTeam = currentSave.standings.find(t => t.city === champion);
        if (champTeam) {
          currentSave.finalsMVP = calculateFinalsMVP(champTeam);
          currentSave.hasSeenFinalsMVPModal = false;
        }
      }
    }
  };

  const handleSimulateLeagueDay = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave || !currentSave.playoffBracket) return;

    const round = currentSave.playoffs?.round || 1;
    const isPlayoffs = !!currentSave.playoffs;
    const isFinals = currentSave.playoffs?.round === 4;

    // Use simulateLeagueDay for strategy-aware outcomes
    const dailyResults = simulateLeagueDay(currentSave.standings, "NONE", "NONE", isPlayoffs, isFinals, currentSave.playoffBracket);

    currentSave.playoffBracket = currentSave.playoffBracket.map(series => {
      if (series.round !== round || series.isCompleted) return series;
      
      const resHigh = dailyResults[series.highSeed];
      const highWon = resHigh === 'W';

      if (highWon) series.highSeedWins += 1;
      else series.lowSeedWins += 1;
      if (series.highSeedWins === 4 || series.lowSeedWins === 4) series.isCompleted = true;
      return series;
    });
    checkAndAdvancePlayoffRound(currentSave);
    saveAndSet(updatedSaves, view);
  };

  const handleStartNewSeason = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    // Extra safety: ensure registry is fresh with current names before generating draft pool
    populateNameRegistry(currentSave);

    // Prevent double generation if user backgrounded right at this moment
    if (currentSave.draftState) {
      setView('lottery');
      return;
    }

    const finalRound = currentSave.playoffBracket?.find(s => s.round === 4);
    const champ = finalRound ? (finalRound.highSeedWins === 4 ? finalRound.highSeed : finalRound.lowSeed) : "N/A";
    const champData = currentSave.standings.find(t => t.city === champ);

    // ARCHIVE LEAGUE HISTORY
    if (!currentSave.leagueHistory) currentSave.leagueHistory = [];
    const alreadyArchived = currentSave.leagueHistory.some(h => h.seasonNumber === currentSave.seasonCount);
    
    if (!alreadyArchived) {
      const leadersData = getLeagueLeadersData(currentSave.standings, currentSave.seasonCount);
      const teamLeadersData = getTeamLeadersData(currentSave.standings);

      const formatTeamLeader = (data: any[]) => ({
        name: data[0].city,
        teamLogo: data[0].city,
        value: data[0].value
      });
      
      const formatAward = (awardData: any) => ({
        name: awardData.player.lastName,
        teamLogo: awardData.teamCity, // We'll store city and map to logo in UI
        pos: awardData.player.position,
        stats: awardData.label === "DEFENSIVE PLAYER OF THE YEAR" 
          ? `${awardData.avgs.reb} / ${awardData.avgs.stl} / ${awardData.avgs.blk}`
          : `${awardData.avgs.pts} / ${awardData.avgs.reb} / ${awardData.avgs.ast}`
      });

      const formatLeader = (leaderData: any) => ({
        name: leaderData.player.lastName,
        teamLogo: leaderData.teamCity,
        pos: leaderData.player.position,
        value: leaderData.avgs[leaderData.statKey] || leaderData.avgs.pts // Fallback for statKey
      });

      // Map winners from leadersData.awards
      const mvp = leadersData.awards.mvp[0];
      const dpoy = leadersData.awards.dpoy[0];
      const smoy = leadersData.awards.smoy[0];
      const roty = leadersData.awards.roty[0];

      const historicalSeason: any = {
        seasonNumber: currentSave.seasonCount,
        year: currentSave.currentYear,
        champion: champ,
        championRecord: champData ? `${champData.wins}-${champData.losses}` : "N/A",
        userRecord: `${currentSave.wins}-${currentSave.losses}`,
        awards: {
          mvp: { name: mvp.player.lastName, teamLogo: mvp.teamCity, pos: mvp.player.position, stats: `${mvp.avgs.pts}/${mvp.avgs.reb}/${mvp.avgs.ast}` },
          dpoy: { name: dpoy.player.lastName, teamLogo: dpoy.teamCity, pos: dpoy.player.position, stats: `${dpoy.avgs.reb}/${dpoy.avgs.stl}/${dpoy.avgs.blk}` },
          smoy: { name: smoy.player.lastName, teamLogo: smoy.teamCity, pos: smoy.player.position, stats: `${smoy.avgs.pts}/${smoy.avgs.reb}/${smoy.avgs.ast}` },
          roty: roty ? { name: roty.player.lastName, teamLogo: roty.teamCity, pos: roty.player.position, stats: `${roty.avgs.pts}/${roty.avgs.reb}/${roty.avgs.ast}` } : null,
          finalsMvp: currentSave.finalsMVP ? { 
            name: currentSave.finalsMVP.lastName, 
            teamLogo: currentSave.finalsMVP.teamCity, 
            pos: currentSave.finalsMVP.position, 
            stats: `${currentSave.finalsMVP.avgs.pts}/${currentSave.finalsMVP.avgs.reb}/${currentSave.finalsMVP.avgs.ast}` 
          } : null
        },
        statLeaders: {
          ppg: { name: leadersData.stats.ppg[0].player.lastName, teamLogo: leadersData.stats.ppg[0].teamCity, pos: leadersData.stats.ppg[0].player.position, value: leadersData.stats.ppg[0].avgs.pts },
          rpg: { name: leadersData.stats.rpg[0].player.lastName, teamLogo: leadersData.stats.rpg[0].teamCity, pos: leadersData.stats.rpg[0].player.position, value: leadersData.stats.rpg[0].avgs.reb },
          apg: { name: leadersData.stats.apg[0].player.lastName, teamLogo: leadersData.stats.apg[0].teamCity, pos: leadersData.stats.apg[0].player.position, value: leadersData.stats.apg[0].avgs.ast },
          spg: { name: leadersData.stats.spg[0].player.lastName, teamLogo: leadersData.stats.spg[0].teamCity, pos: leadersData.stats.spg[0].player.position, value: leadersData.stats.spg[0].avgs.stl },
          bpg: { name: leadersData.stats.bpg[0].player.lastName, teamLogo: leadersData.stats.bpg[0].teamCity, pos: leadersData.stats.bpg[0].player.position, value: leadersData.stats.bpg[0].avgs.blk }
        },
        teamLeaders: {
          ppg: formatTeamLeader(teamLeadersData.ppg),
          rpg: formatTeamLeader(teamLeadersData.rpg),
          apg: formatTeamLeader(teamLeadersData.apg),
          spg: formatTeamLeader(teamLeadersData.spg),
          bpg: formatTeamLeader(teamLeadersData.bpg),
          topg: formatTeamLeader(teamLeadersData.topg),
          fgPct: formatTeamLeader(teamLeadersData.fgPct),
          threePPct: formatTeamLeader(teamLeadersData.threePct)
        }
      };

      currentSave.leagueHistory.push(historicalSeason);
    }

    if (!currentSave.history) currentSave.history = [];
    
    // Prevent duplicate entries for the same season
    const alreadyRecorded = currentSave.history.some(h => h.seasonIndex === currentSave.seasonCount);
    if (!alreadyRecorded) {
      // PRUNE STANDINGS AND BRACKET: Save only essential primitives to prevent memory blowout
      const prunedStandings = currentSave.standings.map(t => ({
        city: t.city,
        wins: t.wins,
        losses: t.losses,
        conf: t.conf,
        rank: calculateRank(t.city, currentSave.standings)
      }));

      const prunedBracket = (currentSave.playoffBracket || []).map(s => ({
        highSeed: s.highSeed,
        lowSeed: s.lowSeed,
        highSeedWins: s.highSeedWins,
        lowSeedWins: s.lowSeedWins,
        round: s.round,
        isCompleted: s.isCompleted
      }));

      currentSave.history.push({
        seasonIndex: currentSave.seasonCount, 
        year: currentSave.currentYear, 
        champion: champ,
        championRecord: champData ? `${champData.wins}-${champData.losses}` : "N/A",
        championRank: champData ? `${calculateRank(champ, currentSave.standings)} in ${champData.conf}` : "N/A",
        userRecord: `${currentSave.wins}-${currentSave.losses}`,
        userRank: `${calculateRank(currentSave.city, currentSave.standings)} in ${currentSave.conference}`,
        standings: prunedStandings as any, // Cast to any to satisfy historical type while being pruned
        playoffBracket: prunedBracket as any
      });
    }

    const { fullOrder, lotteryResults } = generateDraftOrder(currentSave);
    currentSave.lotteryResults = lotteryResults;
    currentSave.draftState = {
      currentPickIndex: 0,
      picks: fullOrder.map((city, idx) => ({ round: idx < 30 ? 1 : 2, overall: idx + 1, teamCity: city })),
      pool: generateDraftPool(75), isCompleted: false
    };
    saveAndSet(updatedSaves, 'lottery');
  };

  const handleDraftPick = (player: Player) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave || !currentSave.draftState) return;

    const pick = currentSave.draftState.picks[currentSave.draftState.currentPickIndex];
    pick.player = player;
    currentSave.standings = currentSave.standings.map(team => {
      if (team.city === pick.teamCity) {
        // AI or User: Add player and refresh rotations
        const newRoster = validateAndFixRoster([...team.roster, { ...player, isStarter: false, isRookie: true }]);
        
        // If it's the user's team, also update currentSave.roster
        if (team.city === currentSave.city) {
          currentSave.roster = newRoster;
        }
        
        return { ...team, roster: newRoster };
      }
      return team;
    });

    currentSave.draftState.pool = currentSave.draftState.pool.filter(p => p.id !== player.id);
    currentSave.draftState.currentPickIndex += 1;
    if (currentSave.draftState.currentPickIndex >= currentSave.draftState.picks.length) currentSave.draftState.isCompleted = true;
    saveAndSet(updatedSaves, 'draft');
  };

  const handleDraftComplete = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    currentSave.wins = 0; currentSave.losses = 0; currentSave.gamesPlayed = 0;
    currentSave.currentYear += 1; currentSave.seasonCount += 1;
    
    // Process aging and then trim rosters to 15 players
    const agedStandings = currentSave.standings.map(team => {
      // Process aging, which returns validateAndFixRoster(agedRoster)
      const newRoster = processAging(team.roster);
      return { 
        ...team, 
        wins: 0, 
        losses: 0, 
        streak: 0,
        totalPoints: 0,
        gamesPlayed: 0,
        recentResults: [],
        roster: newRoster
      };
    });
    
    currentSave.standings = trimRosters(agedStandings);

    const myTeam = currentSave.standings.find(t => t.city === currentSave.city);
    if (myTeam) {
      currentSave.roster = myTeam.roster;
    }

    const { opponents, homeStatuses } = generateSchedule(currentSave.city);
    currentSave.schedule = opponents; currentSave.scheduleHomeStatus = homeStatuses;
    currentSave.playoffs = null; currentSave.playoffBracket = null; currentSave.draftState = null;
    currentSave.hasSeenAwardsModal = false;
    currentSave.hasSeenFinalsMVPModal = false;
    currentSave.finalsMVP = null;

    // Ensure all players have their finalsStats cleared for the new season
    currentSave.standings.forEach(team => {
      team.roster.forEach(player => {
        player.finalsStats = undefined;
      });
    });

    saveAndSet(updatedSaves, 'home');
  };

  const handleDismissAwardsModal = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    currentSave.hasSeenAwardsModal = true;
    saveAndSet(updatedSaves, view);
  };

  const saveAndSet = (newSaves: (GameSave | null)[], nextView?: ViewState) => {
    const finalView = nextView || view;
    
    // Persist current view into the active save if it exists
    if (activeSlot !== null && newSaves[activeSlot - 1]) {
      newSaves[activeSlot - 1]!.lastView = finalView;
    }

    setSaves(newSaves);
    persistSaves(newSaves);
    if (nextView) setView(nextView);
  };

  const handleDismissFinalsMVPModal = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave) return;

    currentSave.hasSeenFinalsMVPModal = true;
    saveAndSet(updatedSaves, view);
  };

  return {
    view, setView, saves, activeSlot, tempCity, selectedTeamCity, setSelectedTeamCity,
    handleDeleteSlot, handleSelectSlot, handleYearSelect, handleTeamSelect, handleConfirmTeam,
    handleGameFinish, handleSimulateLeagueDay, handleStartNewSeason, handleDraftPick, handleDraftComplete,
    handleScout, handleUpdateStrategy, handleDismissAwardsModal, handleDismissFinalsMVPModal
  };
};