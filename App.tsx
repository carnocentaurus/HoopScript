import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { TEAM_ROSTERS } from './src/data/rosters';
import { validateAndFixRoster } from './src/utils/rosterGenerator';
import { calculateRank } from './src/utils/leagueEngine';
import { useGameState } from './src/hooks/useGameState';
import { globalStyles } from './src/styles/globalStyles';

import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import YearSelectionScreen from './src/screens/YearSelectionScreen';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import PlayoffBracketScreen from './src/screens/PlayoffBracketScreen'; 
import FullPlayoffBracketScreen from './src/screens/FullPlayoffBracketScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import TeamOverviewScreen from './src/screens/TeamOverviewScreen';
import DraftScreen from './src/screens/DraftScreen';
import DraftLotteryScreen from './src/screens/DraftLotteryScreen';
import CreditsScreen from './src/screens/CreditsScreen';
import BackgroundMusic from './src/components/BackgroundMusic';

SplashScreen.preventAutoHideAsync();

function MainApp() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const {
    view, setView, saves, activeSlot, tempCity, selectedTeamCity, setSelectedTeamCity,
    handleDeleteSlot, handleSelectSlot, handleYearSelect, handleTeamSelect, handleConfirmTeam,
    handleGameFinish, handleSimulateLeagueDay, handleStartNewSeason, handleDraftPick, handleDraftComplete
  } = useGameState();

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Oswald': require('./assets/fonts/Oswald.ttf'),
          'RobotoCondensed': require('./assets/fonts/RobotoCondensed.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={globalStyles.mainView} onLayout={onLayoutRootView}>
      <BackgroundMusic />
      {view === 'loading' && <LoadingScreen />}
      {view === 'saveSelection' && <SelectSave saves={saves} onSelectSlot={handleSelectSlot} onDeleteSlot={handleDeleteSlot} onViewCredits={() => setView('credits')} />}
      {view === 'credits' && <CreditsScreen onBack={() => setView('saveSelection')} />}
      {view === 'yearSelection' && <YearSelectionScreen onSelectYear={handleYearSelect} onBack={() => setView('saveSelection')} />}
      {view === 'teamSelection' && <TeamSelection onSelectTeam={handleTeamSelect} onBack={() => setView('yearSelection')} />}

      {view === 'teamOverview' && tempCity && (
        (() => {
          const roster = (TEAM_ROSTERS[tempCity] || []).map((p, i) => ({
            id: `initial-${i}`, lastName: p.name, age: 25, number: i + 1,
            position: i < 5 ? ["PG", "SG", "SF", "PF", "C"][i] : ["PG", "SG", "SF", "PF", "C"][Math.floor(Math.random() * 5)],
            offense: p.off, defense: p.def, overall: Math.round((p.off + p.def) / 2),
            isStarter: i < 5, heightFactor: 50, speedFactor: 50,
            stats: { gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, threePM: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0 }
          }));
          return <TeamOverview city={tempCity} roster={validateAndFixRoster(roster)} onConfirm={handleConfirmTeam} onBack={() => setView('teamSelection')} />;
        })()
      )}

      {activeSlot !== null && saves[activeSlot - 1] && (() => {
        const save = saves[activeSlot - 1]!;
        const oppCity = save.playoffs ? save.playoffs.opponentCity : (save.schedule[save.gamesPlayed] || "Free Agent");
        const opp = save.standings.find(t => t.city === oppCity);
        let isHome = save.scheduleHomeStatus[save.gamesPlayed];

        if (save.playoffs) {
          const idx = save.playoffs.myWins + save.playoffs.oppWins;
          const isUserHigh = save.playoffBracket?.find(s => (s.highSeed === save.city || s.lowSeed === save.city) && s.round === save.playoffs!.round)?.highSeed === save.city;
          isHome = isUserHigh ? [true, true, false, false, true, false, true][idx] : ![true, true, false, false, true, false, true][idx];
        }

        const common = { rank: calculateRank(oppCity, save.standings), roster: opp?.roster || [] };

        return (
          <>
            {view === 'home' && (
              <HomeScreen 
                save={save} onQuickSim={() => setView('quickSim')} onSimDay={handleSimulateLeagueDay}
                onViewStandings={() => setView('standings')} onViewBracket={() => setView('bracket')}
                onViewHistory={() => setView('history')} onBackToSaves={() => setView('saveSelection')}
                userTeam={{ city: save.city, record: save.playoffs ? `${save.playoffs.myWins} WINS` : `${save.wins}-${save.losses}`, rank: calculateRank(save.city, save.standings), isHome, isUser: true, roster: save.roster }}
                opponent={{ city: oppCity, record: save.playoffs ? `${save.playoffs.oppWins} WINS` : (opp ? `${opp.wins}-${opp.losses}` : "0-0"), ...common, isHome: !isHome, isUser: false }}
                onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }}
              />
            )}
            {view === 'quickSim' && <QuickSimScreen save={save} opponent={{ city: oppCity, isHome: !isHome, ...common }} onFinish={handleGameFinish} onBack={() => setView('home')} />}
            {view === 'myTeamOverview' && selectedTeamCity && (() => {
              const data = save.standings.find(t => t.city === selectedTeamCity) || { city: save.city, roster: save.roster };
              return <TeamOverviewScreen city={data.city} roster={data.roster} history={save.history} onBack={() => setView(save.draftState && !save.draftState.isCompleted ? 'draft' : (selectedTeamCity === save.city ? 'home' : 'standings'))} />;
            })()}
            {view === 'standings' && <StandingsScreen save={save} onBack={() => setView('home')} onViewTeam={city => { setSelectedTeamCity(city); setView('myTeamOverview'); }} />}
            {view === 'bracket' && <PlayoffBracketScreen save={save} onSimDay={handleSimulateLeagueDay} onBack={() => setView('home')} onStartNewSeason={handleStartNewSeason} onViewFullBracket={() => setView('fullBracket')} />}
            {view === 'fullBracket' && <FullPlayoffBracketScreen save={save} onBack={() => setView('bracket')} />}
            {view === 'history' && <HistoryScreen save={save} onBack={() => setView('home')} />}
            {view === 'lottery' && save.lotteryResults && <DraftLotteryScreen results={save.lotteryResults} onComplete={() => setView('draft')} />}
            {view === 'draft' && save.draftState && <DraftScreen userCity={save.city} draftState={save.draftState} onPick={handleDraftPick} onComplete={handleDraftComplete} onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }} />}
          </>
        );
      })()}
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><MainApp /></SafeAreaProvider>;
}