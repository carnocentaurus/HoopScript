import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import PlayoffBracketScreen from './src/screens/PlayoffBracketScreen'; 
import { GameSave, SeriesMatchup } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';
import { GameResult } from './src/utils/gameSim';
import { ALL_CITIES, generateSchedule, generateInitialStandings } from './src/utils/leagueEngine';

type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings' | 'bracket';

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

const getRankSuffix = (n: number) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};

const calculateRank = (city: string, standings: any[]) => {
  if (!standings || standings.length === 0) return "15th";
  const team = standings.find(t => t.city === city);
  if (!team) return "15th";
  
  const confTeams = standings
    .filter(t => t.conf === team.conf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    
  const index = confTeams.findIndex(t => t.city === city);
  return getRankSuffix(index + 1);
};

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);
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

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    if (saves[slotId - 1]) setView('home');
    else setView('teamSelection');
  };

  const handleTeamSelect = (city: string) => {
    setTempCity(city);
    setView('teamOverview');
  };

  const handleConfirmTeam = () => {
    if (!tempCity || activeSlot === null) return;

    // Fix 1: Generate proper standings where EVERY team has a roster
    const initialStandingsWithRosters = generateInitialStandings().map(team => ({
      ...team,
      roster: generateRoster().map((p: any) => ({
        lastName: p?.lastName || "Player",
        position: p?.position || "G",
        rating: p?.rating || 70
      }))
    }));

    const newSave: GameSave = {
      slotId: activeSlot,
      city: tempCity,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      totalGames: 82,
      rank: 15,
      conference: (ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West') as 'East' | 'West',
      // Fix 2: User roster mapping
      roster: generateRoster().map((p: any) => ({
        lastName: p?.lastName || "Player",
        position: p?.position || "G",
        rating: p?.rating || 70
      })),
      schedule: generateSchedule(tempCity),
      standings: initialStandingsWithRosters,
      playoffs: null,
      playoffBracket: null
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    setSaves(newSaves);
    persistSaves(newSaves);
    setView('home');
  };

  const handleGameFinish = (result: GameResult) => {
    if (activeSlot === null) return;
    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      if (currentSave.playoffs) {
        const userSeriesId = currentSave.playoffBracket?.find((s: SeriesMatchup) => 
          s.highSeed === currentSave.city || s.lowSeed === currentSave.city
        )?.id;

        currentSave.playoffBracket = currentSave.playoffBracket?.map((series: SeriesMatchup) => {
          if (series.isCompleted) return series;
          let highWon = Math.random() > 0.5;
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
           } else {
             alert("Series Won!");
           }
        }
      } else {
        const isWin = result.myScore > result.oppScore;
        const opponentCity = currentSave.schedule[currentSave.gamesPlayed];
        currentSave.wins += isWin ? 1 : 0;
        currentSave.losses += isWin ? 0 : 1;

        currentSave.standings.forEach((team: any) => {
          if (team.city === currentSave.city) {
            team.wins += isWin ? 1 : 0;
            team.losses += isWin ? 0 : 1;
          } else if (team.city === opponentCity) {
            team.wins += isWin ? 0 : 1;
            team.losses += isWin ? 1 : 0;
          } else {
            if (Math.random() > 0.5) team.wins += 1;
            else team.losses += 1;
          }
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
    if (currentSave && currentSave.playoffBracket) {
      currentSave.playoffBracket = currentSave.playoffBracket.map((series: SeriesMatchup) => {
        if (series.isCompleted) return series;
        if (Math.random() > 0.5) series.highSeedWins += 1;
        else series.lowSeedWins += 1;
        if (series.highSeedWins === 4 || series.lowSeedWins === 4) series.isCompleted = true;
        return series;
      });
      setSaves(updatedSaves);
      persistSaves(updatedSaves);
    }
  };

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} />;
  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} />;
  if (view === 'teamOverview' && tempCity) return <TeamOverview city={tempCity} onConfirm={handleConfirmTeam} />;

  if ((view === 'home' || view === 'quickSim') && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave) return null;

    const nextOpponentCity = activeSave.playoffs 
      ? activeSave.playoffs.opponentCity 
      : (activeSave.schedule[activeSave.gamesPlayed] || "Free Agent");

    const oppData = activeSave.standings?.find((t: any) => t.city === nextOpponentCity);
    const isHomeGame = activeSave.playoffs ? (activeSave.playoffs.myWins + activeSave.playoffs.oppWins) % 2 === 0 : activeSave.gamesPlayed % 2 === 0;

    const dynamicOpponent = {
      city: nextOpponentCity,
      record: activeSave.playoffs 
        ? `${activeSave.playoffs.oppWins} WINS` 
        : (oppData ? `${oppData.wins}-${oppData.losses}` : "0-0"),
      rank: calculateRank(nextOpponentCity, activeSave.standings), 
      isHome: !isHomeGame,
      isUser: false,
      roster: oppData?.roster || [] // Crucial safety check
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
          onViewStandings={() => setView('standings')}
          onViewBracket={() => setView('bracket')}
        />
      );
    }
    return <QuickSimScreen save={activeSave} opponent={dynamicOpponent} onFinish={handleGameFinish} />;
  }

  if (view === 'standings' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? <StandingsScreen save={activeSave} onBack={() => setView('home')} /> : null;
  }

  if (view === 'bracket' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return <PlayoffBracketScreen save={activeSave!} onSimDay={handleSimulateLeagueDay} onBack={() => setView('home')} />;
  }

  return null;
}