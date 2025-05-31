import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { PlayerData } from 'screens/game/GameScreen';

import { Header } from '../../../components/Header';
import { PlayerInformation } from '../../../components/PlayerInformation';
import { CardHand } from '../../../components/CardHand';
import { MagicCard } from 'types/Card';
import { PlayerStatsBar } from '../../../components/PlayerStatsBar';

interface GameTableProps {
  playerData: PlayerData[];
  currentPlayerId: string;
  currentTurnPlayerId: string;
  turnTimeRemaining: number;
  onPlayerPress: (playerId: string) => void;
  onCenterPress: () => void;
  onEndTurn?: () => void;
  onLeaveGame: () => void;
  gameCards: MagicCard[];
}

export const GameTable = ({
  playerData,
  currentPlayerId,
  currentTurnPlayerId,
  turnTimeRemaining,
  onPlayerPress,
  onCenterPress,
  onEndTurn,
  onLeaveGame,
  gameCards = [],
}: GameTableProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handlePlayerPress = (playerId: string) => {
    setSelectedPlayerId(playerId);
    if (onPlayerPress) {
      onPlayerPress(playerId);
    }
  };

  // Format time remaining as minutes:seconds
  const formatTimeRemaining = () => {
    const minutes = Math.floor(turnTimeRemaining / 60);
    const seconds = turnTimeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Is it the current user's turn?
  const isCurrentUserTurn = currentTurnPlayerId === currentPlayerId;

  // Remove circle positioning logic and split players
  const opponents = playerData.filter((p) => p.id !== currentPlayerId);
  const rightOpponents = opponents.slice(0, 4);
  const leftOpponents = opponents.slice(4);

  // Find the current player
  const currentPlayer = playerData.find((p) => p.id === currentPlayerId);

  // Calculate reserved space for hand (1/3rd of screen height)
  const screenHeight = Dimensions.get('window').height;
  const handHeight = screenHeight / 4;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Header />

      {/* Game controls */}
      <View className="mb-0 px-3">
        {/* Turn indicator and timer */}
        <View className="mb-2 items-center">
          <Text className="text-lg font-bold text-white">
            {isCurrentUserTurn
              ? 'Your Turn'
              : `${playerData.find((p) => p.id === currentTurnPlayerId)?.name}'s Turn`}
          </Text>
          <View className="mt-1 flex-row items-center">
            <View className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
            <Text className="text-md font-semibold text-amber-300">{formatTimeRemaining()}</Text>
          </View>
        </View>

        {/* Game controls */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="rounded-lg bg-red-600 px-3 py-2" onPress={onLeaveGame}>
            <Text className="font-bold text-white">Leave Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`rounded-lg px-3 py-2 ${isCurrentUserTurn ? 'bg-indigo-600' : 'bg-gray-600'}`}
            onPress={isCurrentUserTurn ? onEndTurn : undefined}
            disabled={!isCurrentUserTurn || !onEndTurn}>
            <Text className={`font-bold ${isCurrentUserTurn ? 'text-white' : 'text-gray-400'}`}>
              End Turn
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Game Area */}
      <View className=" flex-1 flex-row items-center justify-center">
        {/* Left opponents (if any) */}
        {leftOpponents.length > 0 && (
          <View className="absolute bottom-0 left-0 top-0 z-10 justify-center">
            {leftOpponents.map((player) => (
              <View key={player.id} className="my-2">
                <PlayerInformation
                  player={player}
                  isCurrentPlayer={false}
                  isPlayerTurn={player.id === currentTurnPlayerId}
                  onPress={handlePlayerPress}
                />
              </View>
            ))}
          </View>
        )}
        {/* Center game area and current player */}
        <View className="flex-1 items-center justify-center">
          {/* Central Game Area */}
          <TouchableOpacity
            className="mb-4 h-48 w-48 items-center justify-center rounded-full border-4 border-gray-700 bg-gray-800"
            onPress={onCenterPress}>
            <View className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30" />
            <View className="absolute inset-8 rounded-full border-2 border-gray-500 opacity-20" />
            <View className="items-center justify-center">
              <Text className="text-lg font-bold text-white">Game Cards: {gameCards.length}</Text>
              <Text className="text-xs text-gray-400">Tap to view game table</Text>
              {gameCards.length > 0 && (
                <View className="mt-2 h-20 w-14 items-center justify-center">
                  {Array.from({ length: Math.min(7, gameCards.length) }).map((_, index) => (
                    <View
                      key={index}
                      style={{
                        position: 'absolute',
                        width: 40,
                        height: 60,
                        backgroundColor: '#334155',
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#475569',
                        transform: [
                          { rotate: `${(index - 1) * 5}deg` },
                          { translateY: -index * 2 },
                        ],
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        {/* Right opponents */}
        <View className="absolute bottom-0 right-0 top-0 z-10 justify-center">
          {rightOpponents.map((player) => (
            <View key={player.id} className="my-2">
              <PlayerInformation
                player={player}
                isCurrentPlayer={false}
                isPlayerTurn={player.id === currentTurnPlayerId}
                onPress={handlePlayerPress}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Player Hand at the bottom */}
      {currentPlayer && (
        <>
          <CardHand cards={currentPlayer.cards} />
          <PlayerStatsBar player={currentPlayer} />
        </>
      )}
    </SafeAreaView>
  );
};
