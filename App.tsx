import React, { useState, useEffect } from 'react';
import LoadingScreen from './src/screens/LoadingScreen';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';

export default function App() {
  const [view, setView] = useState<'loading' | 'selection' | 'overview'>('loading');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setView('selection');
    }, 3000); // 3-second delay for the splash screen
    return () => clearTimeout(timer);
  }, []);

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setView('overview'); // Navigate to the Overview screen
  };

  const handleConfirmTeam = () => {
    // This will eventually lead to your "Home" or "Dashboard" screen
    console.log(`Confirmed team: ${selectedTeam}`);
    alert(`Welcome to the league, ${selectedTeam}!`);
  };

  // Screen 1: Loading
  if (view === 'loading') {
    return <LoadingScreen />;
  }

  // Screen 3: Team Overview (Selected Team)
  if (view === 'overview' && selectedTeam) {
    return (
      <TeamOverview 
        city={selectedTeam} 
        onConfirm={handleConfirmTeam} 
      />
    );
  }

  // Screen 2: Team Selection (Default)
  return <TeamSelection onSelectTeam={handleTeamSelect} />;
}