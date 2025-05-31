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

import { AVATARS } from './GameSelectionScreen';

// Define the player structure
interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
}

interface LobbyScreenProps {
  gameId: string;
  gameName: string;
  maxPlayers: number;
  isHost: boolean;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const LobbyScreen = ({
  gameId,
  gameName,
  maxPlayers,
  isHost,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onStartGame,
  onLeaveLobby,
}: LobbyScreenProps) => {
  // Players in the lobby
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  // Simulate fetching players in the lobby
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Create initial players list with current user as first player
      const initialPlayers: LobbyPlayer[] = [
        {
          id: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
          isHost,
          isReady: isHost, // Host is always ready
        },
      ];

      // Add some mock players
      if (!isHost) {
        initialPlayers.unshift({
          id: 'host-user',
          name: 'Game Host',
          avatar: 'avatar2',
          isHost: true,
          isReady: true,
        });
      }

      // Add some mock players
      const mockPlayers = [
        {
          id: 'player2',
          name: 'Player 2',
          avatar: 'avatar3',
          isHost: false,
          isReady: true,
        },
        {
          id: 'player3',
          name: 'Player 3',
          avatar: 'avatar4',
          isHost: false,
          isReady: true,
        },
      ];

      setPlayers([...initialPlayers, ...mockPlayers].slice(0, maxPlayers));
      setIsLoading(false);
    };

    fetchPlayers();
  }, [currentUserId, currentUserName, currentUserAvatar, isHost, maxPlayers]);

  // Check if all players are ready
  useEffect(() => {
    const ready = players.length > 0 && players.every((player) => player.isReady);
    setAllPlayersReady(ready);
  }, [players]);

  // Toggle ready status for current user
  const toggleReady = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === currentUserId ? { ...player, isReady: !player.isReady } : player
      )
    );
  };

  // Handle reordering players (only allowed for host)
  const handleDragEnd = ({ data }: { data: LobbyPlayer[] }) => {
    if (isHost) {
      setPlayers(data);
      // In a real app, you would send this updated order to the server
    }
  };

  // Render a player item
  const renderPlayer = ({ item, drag, isActive }: RenderItemParams<LobbyPlayer>) => {
    const canDrag = isHost && !isActive;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={canDrag ? drag : undefined}
          disabled={isActive}
          className={`my-2 flex-row items-center justify-between rounded-xl border border-gray-700 p-4
            ${isActive ? 'bg-gray-400' : 'bg-gray-800'}`}>
          <View className="flex-row items-center">
            <Image
              source={AVATARS.find((a) => a.id === item.avatar)?.source}
              className="mr-3 h-10 w-10 rounded-full"
            />
            <View>
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-white">{item.name}</Text>
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

          <View className={`rounded px-3 py-1.5 ${item.isReady ? 'bg-green-600' : 'bg-gray-600'}`}>
            <Text className="font-bold text-white">{item.isReady ? 'READY' : 'NOT READY'}</Text>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  // Handle start game (only allowed for host)
  const handleStartGame = () => {
    if (!allPlayersReady) {
      Alert.alert('Cannot Start Game', 'All players must be ready to start.');
      return;
    }

    // In a real app, you would notify the server
    onStartGame();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-4">
        <Header />

        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">{gameName}</Text>
              <Text className="text-gray-400">Game ID: {gameId}</Text>
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
                players.find((p) => p.id === currentUserId)?.isReady
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              onPress={toggleReady}>
              <Text className="font-bold text-white">
                {players.find((p) => p.id === currentUserId)?.isReady ? 'NOT READY' : 'READY'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
