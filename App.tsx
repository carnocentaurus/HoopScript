import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TEAM_ROSTERS } from './src/data/rosters';
import { validateAndFixRoster } from './src/utils/rosterGenerator';
import { calculateRank } from './src/utils/leagueEngine';
import { useGameState } from './src/hooks/useGameState';

import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import YearSelectionScreen from './src/screens/YearSelectionScreen';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import PlayoffBracketScreen from './src/screens/PlayoffBracketScreen'; 
import HistoryScreen from './src/screens/HistoryScreen';
import TeamOverviewScreen from './src/screens/TeamOverviewScreen';
import DraftScreen from './src/screens/DraftScreen';
import DraftLotteryScreen from './src/screens/DraftLotteryScreen';

function MainApp() {
  const {
    view, setView, saves, activeSlot, tempCity, selectedTeamCity, setSelectedTeamCity,
    handleDeleteSlot, handleSelectSlot, handleYearSelect, handleTeamSelect, handleConfirmTeam,
    handleGameFinish, handleSimulateLeagueDay, handleStartNewSeason, handleDraftPick, handleDraftComplete
  } = useGameState();

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} onDeleteSlot={handleDeleteSlot} />;
  if (view === 'yearSelection') return <YearSelectionScreen onSelectYear={handleYearSelect} onBack={() => setView('saveSelection')} />;
  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} onBack={() => setView('yearSelection')} />;

  if (view === 'teamOverview' && tempCity) {
    const roster = (TEAM_ROSTERS[tempCity] || []).map((p, i) => ({
      id: `initial-${i}`, lastName: p.name, age: 25, number: i + 1,
      position: i < 5 ? ["PG", "SG", "SF", "PF", "C"][i] : ["PG", "SG", "SF", "PF", "C"][Math.floor(Math.random() * 5)],
      offense: p.off, defense: p.def, overall: Math.round((p.off + p.def) / 2),
      isStarter: i < 5, heightFactor: 50, speedFactor: 50,
      stats: { gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, threePM: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0 }
    }));
    return <TeamOverview city={tempCity} roster={validateAndFixRoster(roster)} onConfirm={handleConfirmTeam} onBack={() => setView('teamSelection')} />;
  }

  if (activeSlot === null) return null;
  const save = saves[activeSlot - 1];
  if (!save) return null;

  if (view === 'home' || view === 'quickSim') {
    const oppCity = save.playoffs ? save.playoffs.opponentCity : (save.schedule[save.gamesPlayed] || "Free Agent");
    const opp = save.standings.find(t => t.city === oppCity);
    let isHome = save.scheduleHomeStatus[save.gamesPlayed];

    if (save.playoffs) {
      const idx = save.playoffs.myWins + save.playoffs.oppWins;
      const isUserHigh = save.playoffBracket?.find(s => (s.highSeed === save.city || s.lowSeed === save.city) && s.round === save.playoffs!.round)?.highSeed === save.city;
      isHome = isUserHigh ? [true, true, false, false, true, false, true][idx] : ![true, true, false, false, true, false, true][idx];
    }

    const common = { rank: calculateRank(oppCity, save.standings), roster: opp?.roster || [] };
    if (view === 'home') return (
      <HomeScreen 
        save={save} onQuickSim={() => setView('quickSim')} onSimDay={handleSimulateLeagueDay}
        onViewStandings={() => setView('standings')} onViewBracket={() => setView('bracket')}
        onViewHistory={() => setView('history')} onBackToSaves={() => setView('saveSelection')}
        userTeam={{ city: save.city, record: save.playoffs ? `${save.playoffs.myWins} WINS` : `${save.wins}-${save.losses}`, rank: calculateRank(save.city, save.standings), isHome, isUser: true, roster: save.roster }}
        opponent={{ city: oppCity, record: save.playoffs ? `${save.playoffs.oppWins} WINS` : (opp ? `${opp.wins}-${opp.losses}` : "0-0"), ...common, isHome: !isHome, isUser: false }}
        onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }}
      />
    );
    return <QuickSimScreen save={save} opponent={{ city: oppCity, isHome: !isHome, ...common }} onFinish={handleGameFinish} onBack={() => setView('home')} />;
  }

  if (view === 'myTeamOverview' && selectedTeamCity) {
    const data = save.standings.find(t => t.city === selectedTeamCity) || { city: save.city, roster: save.roster };
    return <TeamOverviewScreen city={data.city} roster={data.roster} history={save.history} onBack={() => setView(save.draftState && !save.draftState.isCompleted ? 'draft' : (selectedTeamCity === save.city ? 'home' : 'standings'))} />;
  }

  if (view === 'standings') return <StandingsScreen save={save} onBack={() => setView('home')} onViewTeam={city => { setSelectedTeamCity(city); setView('myTeamOverview'); }} />;
  if (view === 'bracket') return <PlayoffBracketScreen save={save} onSimDay={handleSimulateLeagueDay} onBack={() => setView('home')} onStartNewSeason={handleStartNewSeason} />;
  if (view === 'history') return <HistoryScreen save={save} onBack={() => setView('home')} />;
  if (view === 'lottery' && save.lotteryResults) return <DraftLotteryScreen results={save.lotteryResults} onComplete={() => setView('draft')} />;
  if (view === 'draft' && save.draftState) return <DraftScreen userCity={save.city} draftState={save.draftState} onPick={handleDraftPick} onComplete={handleDraftComplete} onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }} />;

  return null;
}

export default function App() {
  return <SafeAreaProvider><MainApp /></SafeAreaProvider>;
}