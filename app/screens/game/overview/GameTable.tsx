import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { PlayerData } from 'screens/game/GameScreen';
import { MagicCard } from 'types/Card';

import { CardHand } from './CardHand';
import { PlayerInformation } from './PlayerInformation';
import { PlayerStatsBar } from './PlayerStatsBar';
import { Header } from '../../../components/Header';
import GameControls from './GameControls';

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
  const [playerDataState, setPlayerDataState] = useState<PlayerData[]>(playerData);
  const [gameCardsState, setGameCardsState] = useState<MagicCard[]>(gameCards);

  const handlePlayerPress = (playerId: string) => {
    setSelectedPlayerId(playerId);
    if (onPlayerPress) {
      onPlayerPress(playerId);
    }
  };

  const handlePlayCard = (cardId: string) => {
    const currentPlayer = playerDataState.find((p) => p.id === currentPlayerId);
    if (!currentPlayer) return;

    const cardToPlay = currentPlayer.cards.find((c) => c.id === cardId);
    if (!cardToPlay) return;

    // Update player's hand
    const updatedPlayers = playerDataState.map((p) => {
      if (p.id === currentPlayerId) {
        return {
          ...p,
          cards: p.cards.filter((c) => c.id !== cardId),
        };
      }
      return p;
    });

    setPlayerDataState(updatedPlayers);
    setGameCardsState((prev) => [...prev, cardToPlay]);
  };

  // Remove circle positioning logic and split players
  const opponents = playerData.filter((p) => p.id !== currentPlayerId);
  const rightOpponents = opponents.slice(0, 4);
  const leftOpponents = opponents.slice(4);

  // Find the current player
  const currentPlayer = playerData.find((p) => p.id === currentPlayerId);

  // Is it the current user's turn?
  const isCurrentUserTurn = currentTurnPlayerId === currentPlayerId;
  const currentTurnPlayerName = playerData.find((p) => p.id === currentTurnPlayerId)?.name || '';

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Header />

      {/* Game controls */}
      <GameControls
        isCurrentUserTurn={isCurrentUserTurn}
        currentTurnPlayerName={currentTurnPlayerName}
        turnTimeRemaining={turnTimeRemaining}
        onLeaveGame={onLeaveGame}
        onEndTurn={onEndTurn}
      />

      {/* Main Game Area */}
      <View className=" mt-40 flex-1 flex-col">
        {/* Left opponents (if any) */}
        {leftOpponents.length > 0 && (
          <View className="absolute left-0 justify-center ">
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
        <View className="flex-1 items-center ">
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
        <View className="absolute right-0 justify-center">
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
          <CardHand cards={currentPlayer.cards} onPlayCard={handlePlayCard} />
          <PlayerStatsBar player={currentPlayer} />
        </>
      )}
    </SafeAreaView>
  );
};
