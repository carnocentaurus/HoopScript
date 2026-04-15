import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screen Imports
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import PlayoffBracketScreen from './src/screens/PlayoffBracketScreen'; 
import HistoryScreen from './src/screens/HistoryScreen';
import TeamOverviewScreen from './src/screens/TeamOverviewScreen';
import DraftScreen from './src/screens/DraftScreen';

// Logic & Types
import { GameSave, SeriesMatchup, Player, DraftPick } from './src/types/save';
import { generateRoster, validateAndFixRoster } from './src/utils/rosterGenerator';
import { GameResult, generatePlayerStats, randomNormal } from './src/utils/gameSim';
import { ALL_CITIES, generateSchedule, generateInitialStandings, updatePlayerStats, processAging, generateDraftOrder, generateDraftPool } from './src/utils/leagueEngine';
import { TEAM_ROSTERS } from './src/data/rosters';

type ViewState = 'loading' | 'saveSelection' | 'yearSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings' | 'bracket' | 'history' | 'myTeamOverview' | 'draft';

const STORAGE_KEY = '@hoopscript_saves';

// --- HELPERS ---
const generateFullBracket = (currentSave: GameSave): SeriesMatchup[] => {
  const bracket: SeriesMatchup[] = [];
  const conferences: ('East' | 'West')[] = ['East', 'West'];

  conferences.forEach(conf => {
    const teams = currentSave.standings
      .filter(t => t.conf === conf)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 8);

    const matchups = [[0, 7], [3, 4], [1, 6], [2, 5]];
    
    matchups.forEach((pair, index) => {
      bracket.push({
        id: `${conf.charAt(0)}${index + 1}`,
        round: 1,
        highSeed: teams[pair[0]].city,
        lowSeed: teams[pair[1]].city,
        highSeedWins: 0,
        lowSeedWins: 0,
        isCompleted: false,
        conference: conf
      });
    });
  });
  return bracket;
};

const calculateRank = (city: string, standings: any[]) => {
  if (!standings || standings.length === 0) return "15";
  const team = standings.find(t => t.city === city);
  if (!team) return "15";
  
  const confTeams = standings
    .filter(t => t.conf === team.conf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    
  const index = confTeams.findIndex(t => t.city === city);
  return (index + 1).toString();
};

const getTeamStrength = (city: string, standings: any[]) => {
  const teamData = standings.find(t => t.city === city);
  if (!teamData || !teamData.roster || teamData.roster.length === 0) return 75;

  const starters = teamData.roster.filter((p: any) => p.isStarter);
  const relevantPlayers = starters.length > 0 ? starters : teamData.roster.slice(0, 5);

  const off = relevantPlayers.reduce((sum: number, p: any) => sum + (p.offense ?? 75), 0) / relevantPlayers.length;
  const def = relevantPlayers.reduce((sum: number, p: any) => sum + (p.defense ?? 75), 0) / relevantPlayers.length;
  
  return (off + def) / 2;
};

const getHighSeedWinProb = (highSeed: string, lowSeed: string, standings: any[]) => {
  const highPower = getTeamStrength(highSeed, standings);
  const lowPower = getTeamStrength(lowSeed, standings);
  const highRank = parseInt(calculateRank(highSeed, standings));
  const lowRank = parseInt(calculateRank(lowSeed, standings));

  // Base 55% for higher seed (Home court + Closeness to top)
  // + 1% for each rank difference
  // + 1% for each OVR difference
  let prob = 0.55 + (highPower - lowPower) / 100 + (lowRank - highRank) * 0.01;
  return Math.max(0.2, Math.min(0.85, prob)); // Cap it between 20% and 85%
};

// --- MAIN CONTENT (State & Routing) ---
function MainApp() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);
  const [selectedTeamCity, setSelectedTeamCity] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isTimerDone, setIsTimerDone] = useState(false);

  useEffect(() => {
    const loadSaves = async () => {
      try {
        const storedSaves = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSaves) setSaves(JSON.parse(storedSaves));
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
    if (saves[slotId - 1]) {
      setView('home');
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

    // Generate rosters for ALL teams once. These are permanent to this save.
    const initialStandingsWithPermanentRosters = generateInitialStandings();

    // Find the roster for the user's team
    const userTeamData = initialStandingsWithPermanentRosters.find(t => t.city === tempCity);

    const newSave: GameSave = {
      id: Date.now().toString(),
      name: `My GM Career - ${tempCity}`,
      slotId: activeSlot,
      city: tempCity,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      totalGames: 82,
      rank: 15,
      conference: (ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West'),
      roster: userTeamData?.roster || [], 
      schedule: generateSchedule(tempCity),
      standings: initialStandingsWithPermanentRosters, 
      playoffs: null,
      playoffBracket: null,
      history: [],
      startYear: selectedYear,
      currentYear: selectedYear,
      seasonCount: 1
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    setSaves(newSaves);
    persistSaves(newSaves);
    setView('home');
  };

  const checkAndAdvancePlayoffRound = (currentSave: GameSave) => {
    if (!currentSave.playoffs || !currentSave.playoffBracket) return;
    
    const currentRound = currentSave.playoffs.round;
    const roundSeries = currentSave.playoffBracket.filter(s => s.round === currentRound);
    const allFinished = roundSeries.every(s => s.isCompleted);

    if (allFinished) {
      if (currentRound < 4) {
        const nextRound = currentRound + 1;
        const winners = roundSeries.map(s => (s.highSeedWins === 4 ? s.highSeed : s.lowSeed));
        const nextMatches: SeriesMatchup[] = [];
        
        for (let i = 0; i < winners.length; i += 2) {
          const teamA = winners[i];
          const teamB = winners[i + 1];
          const rankA = parseInt(calculateRank(teamA, currentSave.standings));
          const rankB = parseInt(calculateRank(teamB, currentSave.standings));
          
          const isAFinishedHigh = rankA < rankB;

          nextMatches.push({
            id: `R${nextRound}-${i}`,
            round: nextRound,
            highSeed: isAFinishedHigh ? teamA : teamB,
            lowSeed: isAFinishedHigh ? teamB : teamA,
            highSeedWins: 0,
            lowSeedWins: 0,
            isCompleted: false,
            conference: currentRound === 3 ? 'Finals' : roundSeries[i].conference,
          });
        }
        currentSave.playoffBracket = [...currentSave.playoffBracket, ...nextMatches];
        
        // Update User Playoff State for next round
        const userSeries = nextMatches.find(s => s.highSeed === currentSave.city || s.lowSeed === currentSave.city);
        if (userSeries) {
          currentSave.playoffs.round = nextRound;
          currentSave.playoffs.opponentCity = userSeries.highSeed === currentSave.city ? userSeries.lowSeed : userSeries.highSeed;
          currentSave.playoffs.myWins = 0;
          currentSave.playoffs.oppWins = 0;
        } else {
          currentSave.playoffs.round = nextRound;
        }
      } else {
        const lastSeries = roundSeries[0];
        const champion = lastSeries.highSeedWins === 4 ? lastSeries.highSeed : lastSeries.lowSeed;
        currentSave.playoffs.isChampion = (champion === currentSave.city);
        alert(`THE ${champion.toUpperCase()} HAVE WON THE CHAMPIONSHIP!`);
      }
    }
  };

  const handleGameFinish = (result: GameResult) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      if (currentSave.playoffs) {
        const userSeriesId = currentSave.playoffBracket?.find((s: SeriesMatchup) => 
          (s.highSeed === currentSave.city || s.lowSeed === currentSave.city) && s.round === currentSave.playoffs!.round
        )?.id;

        currentSave.playoffBracket = currentSave.playoffBracket?.map((series: SeriesMatchup) => {
          if (series.isCompleted || series.round !== currentSave.playoffs!.round) return series;
          
          const highSeedWinProb = getHighSeedWinProb(series.highSeed, series.lowSeed, currentSave.standings);
          let highWon = Math.random() < highSeedWinProb;

          if (series.id === userSeriesId) {
            const isUserHighSeed = series.highSeed === currentSave.city;
            const userWon = result.myScore > result.oppScore;
            highWon = isUserHighSeed ? userWon : !userWon;
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
           if (!won) {
             currentSave.playoffs.isEliminated = true;
           }
        }
        
        checkAndAdvancePlayoffRound(currentSave);
      } else {
        const isWin = result.myScore > result.oppScore;
        const opponentCity = currentSave.schedule[currentSave.gamesPlayed];
        currentSave.wins += isWin ? 1 : 0;
        currentSave.losses += isWin ? 0 : 1;

        // 1. Update User Roster Stats
        currentSave.roster = currentSave.roster.map(p => {
          const pStat = result.myTeamStats.find(s => s.playerId === p.id);
          return pStat ? updatePlayerStats(p, pStat) : p;
        });

        const aiTeams = currentSave.standings.filter(
          (t: any) => t.city !== currentSave.city && t.city !== opponentCity
        );

        for (let i = aiTeams.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [aiTeams[i], aiTeams[j]] = [aiTeams[j], aiTeams[i]];
        }

        const todayResults: Record<string, 'W' | 'L'> = {};
        
        todayResults[currentSave.city] = isWin ? 'W' : 'L';
        todayResults[opponentCity] = isWin ? 'L' : 'W';

        for (let i = 0; i < aiTeams.length; i += 2) {
          const teamA = aiTeams[i];
          const teamB = aiTeams[i + 1];

          if (teamB) { 
            const teamAOvr = teamA.roster.slice(0, 8).reduce((sum: number, p: any) => sum + p.overall, 0) / 8;
            const teamBOvr = teamB.roster.slice(0, 8).reduce((sum: number, p: any) => sum + p.overall, 0) / 8;
            
            const aWinProb = 0.5 + (teamAOvr - teamBOvr) / 100;
            const aWon = Math.random() < aWinProb;
            
            todayResults[teamA.city] = aWon ? 'W' : 'L';
            todayResults[teamB.city] = aWon ? 'L' : 'W';

            const aScore = Math.round(randomNormal(110 + (teamAOvr - teamBOvr), 10));
            const bScore = Math.round(randomNormal(110 + (teamBOvr - teamAOvr), 10));

            // Generate and update AI stats
            teamA.roster = teamA.roster.map((p: any) => updatePlayerStats(p, generatePlayerStats(p, aWon, 0, aScore)));
            teamB.roster = teamB.roster.map((p: any) => updatePlayerStats(p, generatePlayerStats(p, !aWon, 0, bScore)));
          }
        }

        // 2. Update Opponent Roster Stats (for the game user played)
        const oppTeam = currentSave.standings.find((t: any) => t.city === opponentCity);
        if (oppTeam) {
          oppTeam.roster = oppTeam.roster.map((p: any) => {
            const pStat = result.oppTeamStats.find(s => s.playerId === p.id);
            return pStat ? updatePlayerStats(p, pStat) : p;
          });
        }

        currentSave.standings = currentSave.standings.map((team: any) => {
          const gameResult = todayResults[team.city];
          return {
            ...team,
            wins: team.wins + (gameResult === 'W' ? 1 : 0),
            losses: team.losses + (gameResult === 'L' ? 1 : 0)
          };
        });

        currentSave.gamesPlayed += 1;

        if (currentSave.gamesPlayed === 82) {
          const bracket = generateFullBracket(currentSave);
          currentSave.playoffBracket = bracket;
          const userSeries = bracket.find((s: SeriesMatchup) => s.highSeed === currentSave.city || s.lowSeed === currentSave.city);
          
          currentSave.playoffs = {
            round: 1,
            opponentCity: userSeries ? (userSeries.highSeed === currentSave.city ? userSeries.lowSeed : userSeries.highSeed) : "NONE",
            myWins: 0,
            oppWins: 0,
            isEliminated: !userSeries,
            isChampion: false,
          };
        }
      }

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
      setView('home'); 
    }
  };

  const handleSimulateLeagueDay = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];
    if (!currentSave || !currentSave.playoffBracket) return;

    const currentRound = currentSave.playoffs?.round || 1;

    currentSave.playoffBracket = currentSave.playoffBracket.map((series: SeriesMatchup) => {
      if (series.round !== currentRound || series.isCompleted) return series;

      const highSeedWinProb = getHighSeedWinProb(series.highSeed, series.lowSeed, currentSave.standings);

      if (Math.random() < highSeedWinProb) {
        series.highSeedWins += 1;
      } else {
        series.lowSeedWins += 1;
      }

      if (series.highSeedWins === 4 || series.lowSeedWins === 4) series.isCompleted = true;
      return series;
    });

    checkAndAdvancePlayoffRound(currentSave);

    setSaves(updatedSaves);
    persistSaves(updatedSaves);
  };

  const handleStartNewSeason = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      // 1. Record History
      const finalRound = currentSave.playoffBracket?.filter(s => s.round === 4)[0];
      const champ = finalRound 
        ? (finalRound.highSeedWins === 4 ? finalRound.highSeed : finalRound.lowSeed)
        : "N/A";

      if (!currentSave.history) currentSave.history = [];
      currentSave.history.push({
        seasonIndex: currentSave.seasonCount,
        year: currentSave.currentYear,
        champion: champ,
        userRecord: `${currentSave.wins}-${currentSave.losses}`,
        userRank: `${calculateRank(currentSave.city, currentSave.standings)} in ${currentSave.conference}`
      });

      // 2. Initialize Draft
      const draftOrder = generateDraftOrder(currentSave);
      const picks: DraftPick[] = draftOrder.map((city, index) => ({
        round: index < 30 ? 1 : 2,
        overall: index + 1,
        teamCity: city
      }));

      currentSave.draftState = {
        currentPickIndex: 0,
        picks,
        pool: generateDraftPool(75),
        isCompleted: false
      };

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
      setView('draft');
    }
  };

  const handleDraftPick = (player: Player) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave && currentSave.draftState) {
      const { currentPickIndex, picks, pool } = currentSave.draftState;
      const pick = picks[currentPickIndex];
      
      // Update pick with player
      pick.player = player;
      
      // Update team roster
      currentSave.standings = currentSave.standings.map(team => {
        if (team.city === pick.teamCity) {
          const updatedRoster = [...team.roster, { ...player, isStarter: false, isRookie: true }];
          return {
            ...team,
            roster: validateAndFixRoster(updatedRoster)
          };
        }
        return team;
      });

      // Remove from pool and advance index
      currentSave.draftState.pool = pool.filter(p => p.id !== player.id);
      currentSave.draftState.currentPickIndex += 1;

      if (currentSave.draftState.currentPickIndex >= picks.length) {
        currentSave.draftState.isCompleted = true;
      }

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
    }
  };

  const handleDraftComplete = () => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      // 3. Reset for Next Season (The actual transition)
      currentSave.wins = 0;
      currentSave.losses = 0;
      currentSave.gamesPlayed = 0;
      
      currentSave.currentYear += 1;
      currentSave.seasonCount += 1;
      
      currentSave.standings = currentSave.standings.map(team => ({
        ...team,
        wins: 0,
        losses: 0,
        roster: processAging(team.roster)
      }));

      const myTeam = currentSave.standings.find(t => t.city === currentSave.city);
      if (myTeam) {
        currentSave.roster = myTeam.roster;
      }

      currentSave.schedule = generateSchedule(currentSave.city);
      currentSave.playoffs = null;
      currentSave.playoffBracket = null;
      currentSave.draftState = null;

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
      setView('home');
    }
  };

  // --- RENDERING LOGIC ---
  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} onDeleteSlot={handleDeleteSlot} />;
  
  if (view === 'yearSelection') {
    const years = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 1950 + i).reverse();
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setView('saveSelection')} style={{ marginRight: 15 }}>
            <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>← BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { marginBottom: 0, textAlign: 'left' }]}>SELECT STARTING YEAR</Text>
        </View>
        <ScrollView style={styles.scrollList}>
          {years.map(year => (
            <TouchableOpacity 
              key={year} 
              style={styles.yearButton}
              onPress={() => handleYearSelect(year)}
            >
              <Text style={styles.yearText}>{year}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} onBack={() => setView('yearSelection')} />;
  if (view === 'teamOverview' && tempCity) {
    const rawRoster = TEAM_ROSTERS[tempCity] || [];
    const mappedRoster: Player[] = rawRoster.map((p, index) => ({
      id: `initial-${index}`,
      lastName: p.name,
      age: 25, // Default age for preview
      number: index + 1,
      position: ["PG", "SG", "SF", "PF", "C"][index] || "BN",
      offense: p.off,
      defense: p.def,
      overall: Math.round((p.off + p.def) / 2),
      isStarter: index < 5,
      heightFactor: 50,
      speedFactor: 50,
      stats: {
        gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, 
        threePM: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0
      }
    }));

    const fixedRoster = validateAndFixRoster(mappedRoster);

    return (
      <TeamOverview 
        city={tempCity} 
        roster={fixedRoster} 
        onConfirm={handleConfirmTeam} 
        onBack={() => setView('teamSelection')} 
      />
    );
  }

  if ((view === 'home' || view === 'quickSim') && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave) return null;

    const nextOpponentCity = activeSave.playoffs 
      ? activeSave.playoffs.opponentCity 
      : (activeSave.schedule[activeSave.gamesPlayed] || "Free Agent");

    const oppData = activeSave.standings?.find((t: any) => t.city === nextOpponentCity);
    
    let isHomeGame = activeSave.gamesPlayed % 2 === 0;
    
    if (activeSave.playoffs) {
      const gameIndex = activeSave.playoffs.myWins + activeSave.playoffs.oppWins;
      const isHighSeedHome = [true, true, false, false, true, false, true][gameIndex];
      
      const currentSeries = activeSave.playoffBracket?.find((s: SeriesMatchup) => 
        (s.highSeed === activeSave.city || s.lowSeed === activeSave.city) && s.round === activeSave.playoffs!.round
      );
      const isUserHighSeed = currentSeries?.highSeed === activeSave.city;
      
      isHomeGame = isUserHighSeed ? isHighSeedHome : !isHighSeedHome;
    }

    const dynamicOpponent = {
      city: nextOpponentCity,
      record: activeSave.playoffs 
        ? `${activeSave.playoffs.oppWins} WINS` 
        : (oppData ? `${oppData.wins}-${oppData.losses}` : "0-0"),
      rank: calculateRank(nextOpponentCity, activeSave.standings), 
      isHome: !isHomeGame,
      isUser: false,
      roster: oppData?.roster || []
    };

    const dynamicUserTeam = {
      city: activeSave.city,
      record: activeSave.playoffs 
        ? `${activeSave.playoffs.myWins} WINS` 
        : `${activeSave.wins}-${activeSave.losses}`,
      rank: calculateRank(activeSave.city, activeSave.standings),
      isHome: isHomeGame,
      isUser: true,
      roster: activeSave.roster
    };

    if (view === 'home') {
      return (
        <HomeScreen 
          save={activeSave} 
          userTeam={dynamicUserTeam} 
          opponent={dynamicOpponent} 
          onQuickSim={() => setView('quickSim')} 
          onSimDay={handleSimulateLeagueDay}
          onViewStandings={() => setView('standings')}
          onViewBracket={() => setView('bracket')}
          onViewHistory={() => setView('history')}
          onViewTeam={() => {
            setSelectedTeamCity(activeSave.city);
            setView('myTeamOverview');
          }}
          onBackToSaves={() => setView('saveSelection')}
        />
      );
    }
    return <QuickSimScreen save={activeSave} opponent={dynamicOpponent} onFinish={handleGameFinish} onBack={() => setView('home')} />;
  }

  if (view === 'myTeamOverview' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave || !selectedTeamCity) return null;

    const teamData = activeSave.standings.find(t => t.city === selectedTeamCity) || { city: activeSave.city, roster: activeSave.roster };

    return (
      <TeamOverviewScreen 
        city={teamData.city} 
        roster={teamData.roster} 
        history={activeSave.history}
        onBack={() => setView(selectedTeamCity === activeSave.city ? 'home' : 'standings')} 
      />
    );
  }

  if (view === 'standings' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? (
      <StandingsScreen 
        save={activeSave} 
        onBack={() => setView('home')} 
        onViewTeam={(city) => {
          setSelectedTeamCity(city);
          setView('myTeamOverview');
        }}
      />
    ) : null;
  }

  if (view === 'bracket' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return (
      <PlayoffBracketScreen 
        save={activeSave!} 
        onSimDay={handleSimulateLeagueDay} 
        onBack={() => setView('home')} 
        onStartNewSeason={handleStartNewSeason}
      />
    );
  }

  if (view === 'history' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? <HistoryScreen save={activeSave} onBack={() => setView('home')} /> : null;
  }

  if (view === 'draft' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave || !activeSave.draftState) return null;
    return (
      <DraftScreen 
        userCity={activeSave.city} 
        draftState={activeSave.draftState} 
        onPick={handleDraftPick} 
        onComplete={handleDraftComplete} 
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  scrollList: {
    flex: 1,
  },
  yearButton: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C41E3A',
  },
  yearText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

// --- APP ENTRY POINT ---
export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}