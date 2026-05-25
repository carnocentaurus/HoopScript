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
import { OffensiveFocus, DefensiveFocus } from './src/types/save';

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
import LeagueHubScreen from './src/screens/LeagueHubScreen';
import LeagueLeadersScreen from './src/screens/LeagueLeadersScreen';
import DraftScreen from './src/screens/DraftScreen';
import DraftLotteryScreen from './src/screens/DraftLotteryScreen';
import CreditsScreen from './src/screens/CreditsScreen';
import { AudioProvider, useAudioContext } from './src/context/AudioContext';

SplashScreen.preventAutoHideAsync();

function MainApp() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [quickSimParams, setQuickSimParams] = useState<{ expectedOff: OffensiveFocus | null, expectedDef: DefensiveFocus | null } | null>(null);
  const [historicalSeasonIndex, setHistoricalSeasonIndex] = useState<number | null>(null);
  const { isReady, startMusic } = useAudioContext();
  const {
    view, setView, saves, activeSlot, tempCity, selectedTeamCity, setSelectedTeamCity,
    handleDeleteSlot, handleSelectSlot, handleYearSelect, handleTeamSelect, handleConfirmTeam,
    handleGameFinish, handleSimulateLeagueDay, handleStartNewSeason, handleDraftPick, handleDraftComplete,
    handleScout, handleUpdateStrategy, handleDismissAwardsModal, handleDismissFinalsMVPModal
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

  useEffect(() => {
    if (fontsLoaded && isReady && view !== 'loading') {
      startMusic();
    }
  }, [fontsLoaded, isReady, view, startMusic]);

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
            usgRate: 20, tsPct: 0.55, blkRate: 1, stlRate: 1, tovRate: 12, targetMinutes: i < 5 ? 32 : 15,
            stats: { gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, threePM: 0, threePA: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0 }
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

        const common = { 
          rank: calculateRank(oppCity, save.standings), 
          roster: opp?.roster || [],
          coachingIQ: opp?.coachingIQ,
          predictability: opp?.predictability
        };

        return (
          <>
            {view === 'home' && (
              <HomeScreen 
                save={save} 
                onQuickSim={(off, def) => {
                  setQuickSimParams({ expectedOff: off, expectedDef: def });
                  setView('quickSim');
                }} 
                onSimDay={handleSimulateLeagueDay}
                onViewStandings={() => setView('standings')} onViewBracket={() => setView('bracket')}
                onViewHistory={() => setView('history')} onBackToSaves={() => setView('saveSelection')}
                onScout={handleScout} onUpdateStrategy={handleUpdateStrategy}
                userTeam={{ city: save.city, record: save.playoffs ? `${save.playoffs.myWins} WINS` : `${save.wins}-${save.losses}`, rank: calculateRank(save.city, save.standings), isHome, isUser: true, roster: save.roster }}
                opponent={{ city: oppCity, record: save.playoffs ? `${save.playoffs.oppWins} WINS` : (opp ? `${opp.wins}-${opp.losses}` : "0-0"), ...common, isHome: !isHome, isUser: false }}
                onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }}
                onViewHub={() => setView('leagueHub')}
                onDismissAwardsModal={handleDismissAwardsModal}
              />
            )}
            {view === 'leagueHub' && (
              <LeagueHubScreen 
                onBack={() => setView('home')}
                onViewHistory={() => setView('history')}
                onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }}
                onViewStandings={() => setView('standings')}
                onViewLeaders={() => setView('leagueLeaders')}
              />
            )}
            {view === 'leagueLeaders' && <LeagueLeadersScreen save={save} onBack={() => setView('leagueHub')} />}
            {view === 'quickSim' && (
              <QuickSimScreen 
                save={save} 
                opponent={{ city: oppCity, isHome: !isHome, ...common }} 
                onFinish={handleGameFinish} 
                onBack={() => setView('home')} 
                snapshot={quickSimParams}
              />
            )}
            {view === 'myTeamOverview' && selectedTeamCity && (() => {
              const data = save.standings.find(t => t.city === selectedTeamCity) || { city: save.city, roster: save.roster };
              return <TeamOverviewScreen city={data.city} roster={data.roster} history={save.history} teamStanding={save.standings.find(t => t.city === selectedTeamCity)} onBack={() => setView(save.draftState && !save.draftState.isCompleted ? 'draft' : (selectedTeamCity === save.city ? 'leagueHub' : 'standings'))} />;
            })()}
            {view === 'standings' && (() => {
              const displaySave = historicalSeasonIndex 
                ? { ...save, standings: save.history.find(h => h.seasonIndex === historicalSeasonIndex)?.standings || save.standings } 
                : save;
              return (
                <StandingsScreen 
                  save={displaySave as any} 
                  onBack={() => {
                    setView(historicalSeasonIndex ? 'history' : 'leagueHub');
                    setHistoricalSeasonIndex(null);
                  }} 
                  onViewTeam={city => { setSelectedTeamCity(city); setView('myTeamOverview'); }} 
                />
              );
            })()}
            {view === 'bracket' && (() => {
              const displaySave = historicalSeasonIndex 
                ? { ...save, playoffBracket: save.history.find(h => h.seasonIndex === historicalSeasonIndex)?.playoffBracket || save.playoffBracket } 
                : save;
              return (
                <PlayoffBracketScreen 
                  save={displaySave as any} 
                  onSimDay={handleSimulateLeagueDay} 
                  onBack={() => {
                    setView(historicalSeasonIndex ? 'history' : 'home');
                    setHistoricalSeasonIndex(null);
                  }} 
                  onStartNewSeason={handleStartNewSeason} 
                  onViewFullBracket={() => setView('fullBracket')} 
                  onDismissFinalsMVPModal={handleDismissFinalsMVPModal} 
                />
              );
            })()}
            {view === 'fullBracket' && (() => {
              const displaySave = historicalSeasonIndex 
                ? { ...save, playoffBracket: save.history.find(h => h.seasonIndex === historicalSeasonIndex)?.playoffBracket || save.playoffBracket } 
                : save;
              return <FullPlayoffBracketScreen save={displaySave as any} onBack={() => setView('bracket')} />;
            })()}
            {view === 'history' && (
              <HistoryScreen 
                save={save} 
                onBack={() => setView('leagueHub')} 
                onViewStandings={(s) => {
                  setHistoricalSeasonIndex(s ?? null);
                  setView('standings');
                }} 
                onViewBracket={(s) => {
                  setHistoricalSeasonIndex(s ?? null);
                  setView('bracket');
                }} 
              />
            )}
            {view === 'lottery' && save.lotteryResults && <DraftLotteryScreen results={save.lotteryResults} onComplete={() => setView('draft')} />}
            {view === 'draft' && save.draftState && <DraftScreen userCity={save.city} draftState={save.draftState} onPick={handleDraftPick} onComplete={handleDraftComplete} onViewTeam={() => { setSelectedTeamCity(save.city); setView('myTeamOverview'); }} />}
          </>
        );
      })()}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <MainApp />
      </AudioProvider>
    </SafeAreaProvider>
  );
}