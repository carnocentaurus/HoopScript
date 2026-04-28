import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSave, SeriesMatchup, Player } from '../types/save';
import { validateAndFixRoster } from '../utils/rosterGenerator';
import { GameResult, generatePlayerStats, COUNTER_MATRIX } from '../utils/gameSim';
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
  generateScoutReport
} from '../utils/leagueEngine';

import { useSound } from './useSound';
import { OffensiveFocus, DefensiveFocus, Strategy, ScoutReport } from '../types/save';

const STORAGE_KEY = '@hoopscript_saves';

export type ViewState = 'loading' | 'saveSelection' | 'yearSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings' | 'bracket' | 'fullBracket' | 'history' | 'myTeamOverview' | 'lottery' | 'draft' | 'credits';

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
          const migrated = parsed.map((s: any) => {
            if (!s) return null;

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
              currentStrategy: s.currentStrategy ?? {
                offense: OffensiveFocus.ATTACK_PAINT,
                defense: DefensiveFocus.PROTECT_RIM
              },
              roster: migrateRoster(s.roster || []),
              standings: s.standings?.map((t: any) => ({
                ...t,
                coachingIQ: t.coachingIQ ?? (Math.floor(Math.random() * 51) + 40),
                streak: t.streak ?? 0,
                pace: t.pace ?? 100,
                roster: migrateRoster(t.roster || [])
              }))
            };
          });
          setSaves(migrated);
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

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    const save = saves[slotId - 1];
    if (save) {
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
    const initialStandings = generateInitialStandings();
    const userTeamData = initialStandings.find(t => t.city === tempCity);
    const { opponents, homeStatuses } = generateSchedule(tempCity);

    const newSave: GameSave = {
      id: Date.now().toString(),
      name: `My GM Career - ${tempCity}`,
      slotId: activeSlot,
      city: tempCity,
      wins: 0, losses: 0, gamesPlayed: 0, totalGames: 82, rank: 15,
      conference: (ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West'),
      roster: userTeamData?.roster || [], 
      schedule: opponents,
      scheduleHomeStatus: homeStatuses,
      standings: initialStandings, 
      playoffs: null, playoffBracket: null, history: [],
      startYear: selectedYear, currentYear: selectedYear, seasonCount: 1,
      lastView: 'home',
      coachingIQ: 60,
      currentStrategy: {
        offense: OffensiveFocus.ATTACK_PAINT,
        defense: DefensiveFocus.PROTECT_RIM
      },
      lastScoutReport: null
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
    
    // Only generate a new report if we don't already have one for this specific opponent
    if (currentSave.lastScoutReport && currentSave.lastScoutReport.city === oppCity) {
      return;
    }

    const oppStrategy = selectCPUStrategy(); 
    const report = generateScoutReport(oppStrategy, currentSave.coachingIQ);
    report.city = oppCity;
    report.actualStrategy = oppStrategy;

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
      // ... playoff logic (unchanged internally)
      const userSeriesId = currentSave.playoffBracket?.find((s: SeriesMatchup) => 
        (s.highSeed === currentSave.city || s.lowSeed === currentSave.city) && s.round === currentSave.playoffs!.round
      )?.id;

      currentSave.playoffBracket = currentSave.playoffBracket?.map((series: SeriesMatchup) => {
        if (series.isCompleted || series.round !== currentSave.playoffs!.round) return series;
        const highProb = getHighSeedWinProb(series.highSeed, series.lowSeed, currentSave.standings);
        let highWon = Math.random() < highProb;

        if (series.id === userSeriesId) {
          const isUserHigh = series.highSeed === currentSave.city;
          const userWon = result.myScore > result.oppScore;
          highWon = isUserHigh ? userWon : !userWon;
          if (userWon) currentSave.playoffs!.myWins += 1;
          else currentSave.playoffs!.oppWins += 1;
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

      for (let i = 0; i < aiTeams.length; i += 2) {
        const teamA = aiTeams[i]; const teamB = aiTeams[i + 1];
        if (teamB) {
          const strategyA = selectCPUStrategy();
          const strategyB = selectCPUStrategy();
          
          const teamAStrength = getTeamStrength(teamA.city, currentSave.standings);
          const teamBStrength = getTeamStrength(teamB.city, currentSave.standings);
          
          // OVR modifier for simulation probabilities with Tactical Resilience
          let modA = 1.0;
          let modB = 1.0;

          const getAIPenalty = (iq: number) => 0.12 - ((iq / 100) * 0.08); // Max reduction from 12% to 4%

          if (COUNTER_MATRIX[strategyA.offense] === strategyB.defense) {
            modA -= getAIPenalty(teamA.coachingIQ);
          }
          if (COUNTER_MATRIX[strategyB.offense] === strategyA.defense) {
            modB -= getAIPenalty(teamB.coachingIQ);
          }

          const finalA = teamAStrength * modA;
          const finalB = teamBStrength * modB;

          const aWon = Math.random() < (0.5 + (finalA - finalB) / 100);
          todayResults[teamA.city] = aWon ? 'W' : 'L';
          todayResults[teamB.city] = aWon ? 'L' : 'W';
          const aScore = Math.round(randomNormal(110 + (finalA - finalB), 10));
          const bScore = Math.round(randomNormal(110 + (finalB - finalA), 10));
          
          teamA.roster = teamA.roster.map(p => updatePlayerStats(p, generatePlayerStats(p, aWon, 0, aScore, aScore - bScore, strategyA, strategyB, false)));
          teamB.roster = teamB.roster.map(p => updatePlayerStats(p, generatePlayerStats(p, !aWon, 0, bScore, bScore - aScore, strategyB, strategyA, false)));
        }
      }

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

        return { 
          ...team, 
          wins: team.wins + (isWin ? 1 : 0), 
          losses: team.losses + (!isWin ? 1 : 0),
          streak: newStreak
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
    // ... checkAndAdvancePlayoffRound logic (unchanged internally)
    if (!currentSave.playoffs || !currentSave.playoffBracket) return;
    const currentRound = currentSave.playoffs.round;
    const roundSeries = currentSave.playoffBracket.filter(s => s.round === currentRound);
    if (roundSeries.every(s => s.isCompleted)) {
      if (currentRound < 4) {
        const nextRound = currentRound + 1;
        const winners = roundSeries.map(s => (s.highSeedWins === 4 ? s.highSeed : s.lowSeed));
        const nextMatches: SeriesMatchup[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          const teamA = winners[i]; const teamB = winners[i + 1];
          const rankA = parseInt(calculateRank(teamA, currentSave.standings));
          const rankB = parseInt(calculateRank(teamB, currentSave.standings));
          const isAFinishedHigh = rankA < rankB;
          nextMatches.push({
            id: `R${nextRound}-${i}`, round: nextRound,
            highSeed: isAFinishedHigh ? teamA : teamB, lowSeed: isAFinishedHigh ? teamB : teamA,
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
        alert(`THE ${champion.toUpperCase()} HAVE WON THE CHAMPIONSHIP!`);
      }
    }
  };

  const handleSimulateLeagueDay = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave || !currentSave.playoffBracket) return;

    const round = currentSave.playoffs?.round || 1;
    currentSave.playoffBracket = currentSave.playoffBracket.map(series => {
      if (series.round !== round || series.isCompleted) return series;
      const prob = getHighSeedWinProb(series.highSeed, series.lowSeed, currentSave.standings);
      if (Math.random() < prob) series.highSeedWins += 1;
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

    // Prevent double generation if user backgrounded right at this moment
    if (currentSave.draftState) {
      setView('lottery');
      return;
    }

    const finalRound = currentSave.playoffBracket?.find(s => s.round === 4);
    const champ = finalRound ? (finalRound.highSeedWins === 4 ? finalRound.highSeed : finalRound.lowSeed) : "N/A";
    const champData = currentSave.standings.find(t => t.city === champ);

    if (!currentSave.history) currentSave.history = [];
    
    // Prevent duplicate entries for the same season
    const alreadyRecorded = currentSave.history.some(h => h.seasonIndex === currentSave.seasonCount);
    if (!alreadyRecorded) {
      currentSave.history.push({
        seasonIndex: currentSave.seasonCount, year: currentSave.currentYear, champion: champ,
        championRecord: champData ? `${champData.wins}-${champData.losses}` : "N/A",
        championRank: champData ? `${calculateRank(champ, currentSave.standings)} in ${champData.conf}` : "N/A",
        userRecord: `${currentSave.wins}-${currentSave.losses}`,
        userRank: `${calculateRank(currentSave.city, currentSave.standings)} in ${currentSave.conference}`,
        standings: JSON.parse(JSON.stringify(currentSave.standings)),
        playoffBracket: JSON.parse(JSON.stringify(currentSave.playoffBracket || []))
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

    saveAndSet(updatedSaves, 'home');
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

  return {
    view, setView, saves, activeSlot, tempCity, selectedTeamCity, setSelectedTeamCity,
    handleDeleteSlot, handleSelectSlot, handleYearSelect, handleTeamSelect, handleConfirmTeam,
    handleGameFinish, handleSimulateLeagueDay, handleStartNewSeason, handleDraftPick, handleDraftComplete,
    handleScout, handleUpdateStrategy
  };
};