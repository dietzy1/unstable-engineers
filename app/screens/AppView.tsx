import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LoadingScreen } from './LoadingScreen';
import { GameScreen } from './game/GameScreen';
import { GameSelectionScreen } from './lobby/GameSelectionScreen';

// Storage keys
const USER_PROFILE_KEY = 'user_profile';

export const AppView = () => {
  // Track connection state and active game
  const [isConnected, setIsConnected] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);

  // Simulate checking if user is already connected to a game
  useEffect(() => {
    const initialize = async () => {
      try {
        // In a real app, this would check with a server if the user
        // is already in a game session
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Load user profile if exists
        const profileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (profileJson) {
          setUserProfile(JSON.parse(profileJson));
        }

        // For demo purposes, default to not connected
        setIsConnected(false);
        setActiveGameId(null);
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Handler for joining an existing game
  const handleJoinGame = (gameId: string) => {
    console.log(`Joining game: ${gameId}`);
    setIsLoading(true);

    // Simulate API call to join game
    setTimeout(() => {
      setActiveGameId(gameId);
      setIsConnected(true);
      setIsLoading(false);
    }, 1000);
  };

  // Handler for creating a new game
  const handleCreateGame = (gameName: string, maxPlayers: number, gameType: string) => {
    console.log(`Creating game: ${gameName} with ${maxPlayers} players, type: ${gameType}`);
    setIsLoading(true);

    // Simulate API call to create game
    setTimeout(() => {
      // In a real app, we would send this to a server to create the game
      // and get back a game ID
      const mockGameId = `game-${Date.now()}`;
      setActiveGameId(mockGameId);
      setIsConnected(true);
      setIsLoading(false);
    }, 1000);
  };

  // Handler for profile updates
  const handleProfileUpdate = (profile: { username: string; avatar: string }) => {
    setUserProfile(profile);
  };

  // Handler for leaving a game
  const handleLeaveGame = () => {
    setIsLoading(true);

    // Simulate API call to leave game
    setTimeout(() => {
      setIsConnected(false);
      setActiveGameId(null);
      setIsLoading(false);
    }, 800);
  };

  // Show loading screen while checking connection
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render the appropriate screen based on connection state
  return isConnected && activeGameId ? (
    <GameScreen onLeaveGame={handleLeaveGame} gameId={activeGameId} userProfile={userProfile} />
  ) : (
    <GameSelectionScreen
      onJoinGame={handleJoinGame}
      onCreateGame={handleCreateGame}
      onProfileUpdate={handleProfileUpdate}
    />
  );
};
