import React, { useState, useEffect } from 'react';
import LoadingScreen from './src/screens/LoadingScreen';
import TeamSelection from './src/screens/TeamSelection';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3-second delay
    return () => clearTimeout(timer);
  }, []);

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    // Future step: Navigate to Team Overview
    console.log("Selected:", team);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <TeamSelection onSelectTeam={handleTeamSelect} />;
}