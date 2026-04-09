import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import { GameSave, PlayoffSeries } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';
import { GameResult } from './src/utils/gameSim';
import { ALL_CITIES, generateSchedule, generateInitialStandings } from './src/utils/leagueEngine';

type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings';

const STORAGE_KEY = '@hoopscript_saves';

// Helper function to start playoffs
const startPlayoffs = (currentSave: GameSave): PlayoffSeries | null => {
  const myConf = currentSave.standings
    .filter(t => t.conf === currentSave.conference)
    .sort((a, b) => b.wins - a.wins);

  const userRank = myConf.findIndex(t => t.city === currentSave.city) + 1;
  
  if (userRank > 8) {
    alert("Season Over: You missed the playoffs.");
    return null; 
  }

  const opponentIndex = 8 - userRank; 
  const opponent = myConf[opponentIndex];

  return {
    round: 1,
    opponentCity: opponent.city,
    myWins: 0,
    oppWins: 0,
    isEliminated: false, 
    isChampion: false,   
  };
};

// Simplified opponent generator for rounds 2-4
const getNextPlayoffOpponent = (save: GameSave, round: number) => {
  const myConf = save.standings.filter(t => t.conf === save.conference).sort((a, b) => b.wins - a.wins);
  const oppConf = save.standings.filter(t => t.conf !== save.conference).sort((a, b) => b.wins - a.wins);
  
  if (round === 2) return myConf.find(t => t.city !== save.city)?.city || "TBD"; 
  if (round === 3) return myConf[1].city === save.city ? myConf[0].city : myConf[1].city; 
  if (round === 4) return oppConf[0].city; 
  return "TBD";
};

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isTimerDone, setIsTimerDone] = useState(false);

  const getRankSuffix = (n: number) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
  };

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

    const newSave: GameSave = {
      slotId: activeSlot,
      city: tempCity,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      totalGames: 82,
      rank: 15,
      conference: (ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West') as 'East' | 'West',
      roster: generateRoster(),
      schedule: generateSchedule(tempCity),
      standings: generateInitialStandings(),
      playoffs: null
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
      const isWin = result.myScore > result.oppScore;

      // --- PLAYOFF LOGIC ---
      if (currentSave.playoffs) {
        if (isWin) currentSave.playoffs.myWins += 1;
        else currentSave.playoffs.oppWins += 1;

        if (currentSave.playoffs.myWins === 4) {
          if (currentSave.playoffs.round === 4) {
            currentSave.playoffs.isChampion = true; // Mark as Champion
            alert("CONGRATULATIONS! YOU WON THE CHAMPIONSHIP!");
          } else {
            alert(`You won the series! Advancing to Round ${currentSave.playoffs.round + 1}`);
            currentSave.playoffs.round += 1;
            currentSave.playoffs.myWins = 0;
            currentSave.playoffs.oppWins = 0;
            currentSave.playoffs.opponentCity = getNextPlayoffOpponent(currentSave, currentSave.playoffs.round);
          }
        } else if (currentSave.playoffs.oppWins === 4) {
          currentSave.playoffs.isEliminated = true; // Mark as Eliminated
          alert("Eliminated from the playoffs!");
        }
      } 
      // --- REGULAR SEASON LOGIC ---
      else {
        const opponentCity = currentSave.schedule[currentSave.gamesPlayed];
        currentSave.wins += isWin ? 1 : 0;
        currentSave.losses += isWin ? 0 : 1;

        currentSave.standings.forEach(team => {
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

        const myConf = currentSave.standings
          .filter(t => t.conf === currentSave.conference)
          .sort((a, b) => b.wins - a.wins);
        
        currentSave.rank = myConf.findIndex(t => t.city === currentSave.city) + 1;
        currentSave.gamesPlayed += 1;

        if (currentSave.gamesPlayed === 82) {
          currentSave.playoffs = startPlayoffs(currentSave);
        }
      }

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
      setView('home'); 
    }
  };

  // --- Rendering Logic (Simplified home/quickSim for brevity) ---

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} />;
  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} />;
  if (view === 'teamOverview' && tempCity) return <TeamOverview city={tempCity} onConfirm={handleConfirmTeam} />;

  if ((view === 'home' || view === 'quickSim') && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave) return null;

    const nextOpponentCity = activeSave.playoffs 
      ? activeSave.playoffs.opponentCity 
      : (activeSave.schedule[activeSave.gamesPlayed] || "TBD");
      
    const oppData = activeSave.standings?.find(t => t.city === nextOpponentCity);
    const seriesGamesPlayed = activeSave.playoffs ? (activeSave.playoffs.myWins + activeSave.playoffs.oppWins) : 0;

    const userTeam = {
      city: activeSave.city,
      record: activeSave.playoffs ? `WINS: ${activeSave.playoffs.myWins}` : `${activeSave.wins}-${activeSave.losses}`,
      rank: getRankSuffix(activeSave.rank),
      isHome: activeSave.playoffs ? (seriesGamesPlayed % 2 !== 0) : (activeSave.gamesPlayed % 2 !== 0),
      isUser: true
    };

    const dynamicOpponent = {
      ...oppData,
      city: nextOpponentCity,
      record: activeSave.playoffs ? `WINS: ${activeSave.playoffs.oppWins}` : (oppData ? `${oppData.wins}-${oppData.losses}` : "0-0"),
      rank: activeSave.playoffs ? "TBD" : "TBD", // Rank display logic can be added here
      isHome: activeSave.playoffs ? (seriesGamesPlayed % 2 === 0) : (activeSave.gamesPlayed % 2 === 0),
      isUser: false
    };

    if (view === 'home') {
      return (
        <HomeScreen 
          save={activeSave} 
          userTeam={userTeam}
          opponent={dynamicOpponent} 
          onQuickSim={() => setView('quickSim')}
          onViewStandings={() => setView('standings')}
        />
      );
    }

    return (
      <QuickSimScreen 
        save={activeSave} 
        opponent={dynamicOpponent} 
        onFinish={handleGameFinish} 
      />
    );
  }

  if (view === 'standings' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? <StandingsScreen save={activeSave} onBack={() => setView('home')} /> : null;
  }

  return null;
}