import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

import { LoadingScreen } from './LoadingScreen';
import { GameScreen } from './game/GameScreen';
import { GameSelectionScreen, MOCK_GAMES } from './lobby/GameSelectionScreen';
import { LobbyScreen } from './lobby/LobbyScreen';

// Storage keys
const USER_PROFILE_KEY = 'user_profile';

// Define game type to match MOCK_GAMES
interface Game {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
}

export const AppView = () => {
  // Track connection state and active game
  const [isConnected, setIsConnected] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [gameName, setGameName] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);
  const [userId, setUserId] = useState<string>('');

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

        // Get user ID from AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
        }

        // For demo purposes, default to not connected
        setIsConnected(false);
        setInLobby(false);
        setActiveGameId(null);
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
        setInLobby(false);
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

      // Find the game in the mock data to get its name
      const foundGame = MOCK_GAMES.find((game: Game) => game.id === gameId);
      if (foundGame) {
        setGameName(foundGame.name);
        setMaxPlayers(foundGame.maxPlayers);
      } else {
        setGameName('Unknown Game');
        setMaxPlayers(4);
      }

      setIsHost(false);
      setInLobby(true);
      setIsLoading(false);
    }, 1000);
  };

  // Handler for creating a new game
  const handleCreateGame = (gameName: string, maxPlayers: number) => {
    console.log(`Creating game: ${gameName} with ${maxPlayers} players`);
    setIsLoading(true);

    // Simulate API call to create game
    setTimeout(() => {
      // In a real app, we would send this to a server to create the game
      // and get back a game ID
      const mockGameId = `game-${Date.now()}`;
      setActiveGameId(mockGameId);
      setGameName(gameName);
      setMaxPlayers(maxPlayers);
      setIsHost(true);
      setInLobby(true);
      setIsLoading(false);
    }, 1000);
  };

  // Handler for profile updates
  const handleProfileUpdate = (profile: { username: string; avatar: string }) => {
    setUserProfile(profile);
  };

  // Handler for leaving a game or lobby
  const handleLeaveLobbyOrGame = () => {
    setIsLoading(true);

    // Simulate API call to leave game
    setTimeout(() => {
      setIsConnected(false);
      setInLobby(false);
      setActiveGameId(null);
      setIsLoading(false);
    }, 800);
  };

  // Handler for starting the game from the lobby
  const handleStartGame = () => {
    console.log(`Starting game: ${activeGameId}`);
    setIsLoading(true);

    // Simulate API call to start the game
    setTimeout(() => {
      setInLobby(false);
      setIsConnected(true);
      setIsLoading(false);
    }, 800);
  };

  // Show loading screen while checking connection
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render the appropriate screen based on connection state
  if (isConnected && activeGameId) {
    return (
      <GameScreen
        onLeaveGame={handleLeaveLobbyOrGame}
        gameId={activeGameId}
        userProfile={userProfile}
      />
    );
  } else if (inLobby && activeGameId) {
    return (
      <LobbyScreen
        gameId={activeGameId}
        gameName={gameName}
        maxPlayers={maxPlayers}
        isHost={isHost}
        currentUserId={userId}
        currentUserName={userProfile?.username || 'Player'}
        currentUserAvatar={userProfile?.avatar || 'avatar1'}
        onStartGame={handleStartGame}
        onLeaveLobby={handleLeaveLobbyOrGame}
      />
    );
  } else {
    return (
      <GameSelectionScreen
        onJoinGame={handleJoinGame}
        onCreateGame={handleCreateGame}
        onProfileUpdate={handleProfileUpdate}
      />
    );
  }
};
