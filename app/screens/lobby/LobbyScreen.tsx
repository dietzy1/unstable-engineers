import { Header } from 'components/Header';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { LobbyState, PlayerInfo } from 'services/payload';

import { AVATARS } from './GameSelectionScreen';
import { wsService } from '../../services/websocket';

interface LobbyScreenProps {
  gameId: string;
  gameName: string;
  maxPlayers: number;
  isHost: boolean;
  currentUserId: string;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const LobbyScreen = ({
  gameId,
  gameName,
  maxPlayers,
  isHost,
  currentUserId,
  onStartGame,
  onLeaveLobby,
}: LobbyScreenProps) => {
  // Players in the lobby
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  console.log('Players:', players);

  // Set up WebSocket message handlers
  useEffect(() => {
    const handleLobbyState = (payload: LobbyState) => {
      console.log('Received lobby state:', payload);
      setPlayers(payload.players);
    };

    const handlePlayerJoined = (payload: { player: PlayerInfo }) => {
      console.log('Player joined:', payload);
      setPlayers((prev) => [...prev, payload.player]);
    };

    const handlePlayerLeft = (payload: { userId: string }) => {
      console.log('Player left:', payload);
      setPlayers((prev) => prev.filter((p) => p.id !== payload.userId));
    };

    const handlePlayerReadyChanged = (payload: { userId: string; ready: boolean }) => {
      console.log('Player ready changed:', payload);
      setPlayers((prev) =>
        prev.map((p) => (p.id === payload.userId ? { ...p, ready: payload.ready } : p))
      );
    };

    const handleHostChanged = (payload: { newHostId: string }) => {
      console.log('Host changed:', payload);
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          isHost: p.id === payload.newHostId,
        }))
      );
    };

    const handlePlayersReordered = (payload: { playerOrder: string[] }) => {
      console.log('Players reordered:', payload);
      const newOrder = payload.playerOrder.map((id) => players.find((p) => p.id === id)!);
      setPlayers(newOrder);
    };

    const handleError = (payload: { message: string }) => {
      console.error('WebSocket error:', payload);
      Alert.alert('Error', payload.message);
    };

    // Subscribe to WebSocket events
    wsService.on('lobby_state', handleLobbyState);
    wsService.on('player_joined', handlePlayerJoined);
    wsService.on('player_left', handlePlayerLeft);
    wsService.on('player_ready_changed', handlePlayerReadyChanged);
    wsService.on('host_changed', handleHostChanged);
    wsService.on('players_reordered', handlePlayersReordered);
    wsService.on('error', handleError);

    console.log('Joining lobby:', gameId);
    wsService.joinLobby(gameId);

    return () => {
      // Unsubscribe from WebSocket events
      wsService.off('lobby_state', handleLobbyState);
      wsService.off('player_joined', handlePlayerJoined);
      wsService.off('player_left', handlePlayerLeft);
      wsService.off('player_ready_changed', handlePlayerReadyChanged);
      wsService.off('host_changed', handleHostChanged);
      wsService.off('players_reordered', handlePlayersReordered);
      wsService.off('error', handleError);
    };
  }, [gameId, onStartGame]);

  // Check if all players are ready
  useEffect(() => {
    const ready = players.length > 0 && players.every((player) => player.ready);
    setAllPlayersReady(ready);
  }, [players]);

  // Toggle ready status for current user
  const toggleReady = () => {
    wsService.toggleReady();
  };

  // Handle reordering players (only allowed for host)
  const handleDragEnd = ({ data }: { data: PlayerInfo[] }) => {
    if (isHost) {
      wsService.reorderPlayers(data.map((p) => p.id));
    }
  };

  // Handle start game (only allowed for host)
  const handleStartGame = () => {
    if (!allPlayersReady) {
      Alert.alert('Cannot Start Game', 'All players must be ready to start.');
      return;
    }

    wsService.startGame();
  };

  // Render a player item
  const renderPlayer = ({ item, drag, isActive }: RenderItemParams<PlayerInfo>) => {
    const canDrag = isHost && !isActive;

    console.log('item', item);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={canDrag ? drag : undefined}
          disabled={isActive}
          className={`my-2 flex-row items-center justify-between rounded-xl border border-gray-700 p-4
            ${isActive ? 'bg-gray-400' : 'bg-gray-800'}`}>
          <View className="flex-row items-center">
            <Image
              source={AVATARS.find((a) => a.id === item.avatarId)?.source}
              style={{
                marginRight: 12,
                width: 40,
                height: 40,
                borderRadius: 28,
              }}
            />
            <View>
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-white">{item.username}</Text>
                {item.isHost && (
                  <View className="ml-2 rounded bg-amber-600 px-2 py-0.5">
                    <Text className="text-xs font-bold text-white">HOST</Text>
                  </View>
                )}
              </View>
              {isHost && !item.isHost && (
                <Text className="text-xs text-gray-400">Drag to reorder</Text>
              )}
            </View>
          </View>

          <View className={`rounded px-3 py-1.5 ${item.ready ? 'bg-green-600' : 'bg-gray-600'}`}>
            <Text className="font-bold text-white">{item.ready ? 'READY' : 'NOT READY'}</Text>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-4">
        <Header />

        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">{gameName}</Text>

              <Text className="text-gray-400">Game ID: {gameId.substring(0, 15)}...</Text>
            </View>

            <View className="flex-row items-center">
              <Text className="mr-2 text-white">Players:</Text>
              <View className="rounded bg-indigo-700 px-2 py-0.5">
                <Text className="font-bold text-white">
                  {players.length}/{maxPlayers}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <View className="flex-1">
            <Text className="mb-2 text-lg font-bold text-white">
              Players {isHost ? '(Drag to reorder)' : ''}
            </Text>

            <DraggableFlatList
              data={players}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderPlayer}
            />
          </View>
        )}

        <View className="mt-4 flex-row justify-between">
          <TouchableOpacity className="rounded-lg bg-red-600 px-6 py-3" onPress={onLeaveLobby}>
            <Text className="font-bold text-white">LEAVE LOBBY</Text>
          </TouchableOpacity>

          {isHost ? (
            <TouchableOpacity
              className={`rounded-lg px-6 py-3 ${allPlayersReady ? 'bg-green-600' : 'bg-gray-600'}`}
              onPress={handleStartGame}
              disabled={!allPlayersReady}>
              <Text className="font-bold text-white">START GAME</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`rounded-lg px-6 py-3 ${
                players.find((p) => p.id === currentUserId)?.ready
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              onPress={toggleReady}>
              <Text className="font-bold text-white">
                {players.find((p) => p.id === currentUserId)?.ready ? 'NOT READY' : 'READY'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
