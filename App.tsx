import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen'; // NEW IMPORT
import { GameSave } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';
import { GameResult } from './src/utils/gameSim';
import { ALL_CITIES, generateSchedule, generateInitialStandings } from './src/utils/leagueEngine';

type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim' | 'standings';

const STORAGE_KEY = '@hoopscript_saves';

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
        if (storedSaves) {
          setSaves(JSON.parse(storedSaves));
        }
      } catch (e) {
        console.error("Failed to load saves from storage", e);
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
      console.error("Failed to save data to storage", e);
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
      conference: ALL_CITIES.indexOf(tempCity) < 15 ? 'East' : 'West',
      roster: generateRoster(),
      schedule: generateSchedule(tempCity),
      standings: generateInitialStandings()
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
          // Simulate other league games
          if (Math.random() > 0.5) team.wins += 1;
          else team.losses += 1;
        }
      });

      const myConf = currentSave.standings
        .filter(t => t.conf === currentSave.conference)
        .sort((a, b) => b.wins - a.wins);
      
      currentSave.rank = myConf.findIndex(t => t.city === currentSave.city) + 1;
      currentSave.gamesPlayed += 1;

      setSaves(updatedSaves);
      persistSaves(updatedSaves);
      setView('home'); 
    }
  };

  // --- Rendering Logic ---

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} />;
  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} />;
  if (view === 'teamOverview' && tempCity) return <TeamOverview city={tempCity} onConfirm={handleConfirmTeam} />;

  if (view === 'home' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave || !activeSave.schedule) return null;

    const nextOpponentCity = activeSave.schedule[activeSave.gamesPlayed] || "TBD";
    const oppData = activeSave.standings?.find(t => t.city === nextOpponentCity);

    let opponentRankDisplay = "TBD";
    if (oppData) {
      const oppConfTeams = activeSave.standings
        .filter(t => t.conf === oppData.conf)
        .sort((a, b) => b.wins - a.wins);
      const rankIndex = oppConfTeams.findIndex(t => t.city === nextOpponentCity) + 1;
      opponentRankDisplay = getRankSuffix(rankIndex);
    }

    const dynamicOpponent = {
      city: nextOpponentCity,
      record: oppData ? `${oppData.wins}-${oppData.losses}` : "0-0",
      rank: opponentRankDisplay,
      isHome: activeSave.gamesPlayed % 2 === 0
    };

    return (
      <HomeScreen 
        save={activeSave} 
        opponent={dynamicOpponent} 
        onQuickSim={() => setView('quickSim')}
        onViewStandings={() => setView('standings')} // ADDED PROP
      />
    );
  }

  if (view === 'quickSim' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    if (!activeSave || !activeSave.schedule) return null;

    const nextOpponentCity = activeSave.schedule[activeSave.gamesPlayed] || "TBD";
    const oppData = activeSave.standings?.find(t => t.city === nextOpponentCity);

    const dynamicOpponent = {
      city: nextOpponentCity,
      record: oppData ? `${oppData.wins}-${oppData.losses}` : "0-0",
      rank: "TBD",
      isHome: activeSave.gamesPlayed % 2 === 0
    };

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
    return activeSave ? (
      <StandingsScreen 
        save={activeSave} 
        onBack={() => setView('home')} 
      />
    ) : null;
  }

  return null;
}