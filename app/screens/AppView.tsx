import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { CreateLobbyResponse } from 'services/payload';
import { v4 as uuidv4 } from 'uuid';

import { LoadingScreen } from './LoadingScreen';
import { GameScreen } from './game/GameScreen';
import { GameSelectionScreen } from './lobby/GameSelectionScreen';
import { LobbyScreen } from './lobby/LobbyScreen';
import { wsService } from '../services/websocket';

// Storage keys
const USER_PROFILE_KEY = 'user_profile';
const USER_ID_KEY = 'user_id';

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

  // WebSocket message handlers
  const handleLobbyCreated = (payload: CreateLobbyResponse) => {
    setActiveGameId(payload.lobbyId);
    setGameName(payload.gameName);
    setMaxPlayers(payload.maxPlayers);
    setIsHost(true);
    setInLobby(true);
  };

  const handleGameStarting = (payload: any) => {
    setInLobby(false);
    setIsConnected(true);
  };

  const handleError = (payload: { message: string }) => {
    console.error('WebSocket error:', payload.message);
  };

  // Initialize WebSocket connection and game state
  useEffect(() => {
    const initialize = async () => {
      try {
        const profileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        const currentUserId = storedUserId || uuidv4();
        let currentUsername = 'Player';
        let currentAvatar = 'avatar1';

        if (profileJson) {
          const profile = JSON.parse(profileJson);
          setUserProfile(profile);
          currentUsername = profile.username;
          currentAvatar = profile.avatar;
        }

        if (currentUserId) {
          setUserId(currentUserId);
        }

        // Connect to WebSocket with user info
        wsService.connect(currentUserId, currentUsername, currentAvatar);

        wsService.on('lobby_created', handleLobbyCreated);
        wsService.on('game_starting', handleGameStarting);
        wsService.on('error', handleError);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // This cleanup function will run when AppView unmounts
    return () => {
      console.log('Unsubscribing from AppView WebSocket events and disconnecting.');
      wsService.off('lobby_created', handleLobbyCreated);
      wsService.off('game_starting', handleGameStarting);
      wsService.off('error', handleError);
      wsService.disconnect();
    };
  }, []);

  // Handler for joining an existing game
  const handleJoinGame = (gameId: string) => {
    console.log(`Joining game: ${gameId}`);
    setIsLoading(true);

    wsService.joinLobby(gameId);
    setActiveGameId(gameId);
    setIsHost(false);
    setInLobby(true);
    setIsLoading(false);
  };

  // Handler for creating a new game
  const handleCreateGame = (gameName: string, maxPlayers: number) => {
    console.log(`Creating game: ${gameName} with ${maxPlayers} players`);
    setIsLoading(true);

    wsService.createLobby(gameName, maxPlayers);
    setGameName(gameName);
    setMaxPlayers(maxPlayers);
    setIsHost(true);
    setInLobby(true);
    setIsLoading(false);
  };

  // Handler for profile updates
  const handleProfileUpdate = (profile: { username: string; avatar: string }) => {
    setUserProfile(profile);
  };

  // Handler for leaving a game or lobby
  const handleLeaveLobbyOrGame = () => {
    setIsLoading(true);

    if (inLobby) {
      wsService.leaveLobby();
    }

    setIsConnected(false);
    setInLobby(false);
    setActiveGameId(null);
    setIsLoading(false);
  };

  // Handler for starting the game from the lobby
  const handleStartGame = () => {
    console.log(`Starting game: ${activeGameId}`);
    setIsLoading(true);

    wsService.startGame();
    setInLobby(false);
    setIsConnected(true);
    setIsLoading(false);
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
