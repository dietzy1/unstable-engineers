import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { CardProps } from './Card';
import { PlayerDetailScreen } from 'screens/game/PlayerDetailScreen';
import { Header } from './Header';
import { AVATARS } from 'screens/lobby/GameSelectionScreen';
import { PlayerData } from 'screens/game/GameScreen';
import { PlayerInformation } from './PlayerInformation';

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');
const CIRCLE_RADIUS = Math.min(width, height) * 0.39;

interface GameTableProps {
  playerData: PlayerData[];
  currentPlayerId: string;
  currentTurnPlayerId: string;
  turnTimeRemaining: number;
  onPlayerPress: (playerId: string) => void;
  onCenterPress: () => void;
  onEndTurn?: () => void;
  onLeaveGame: () => void;
  gameCards: CardProps[];
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
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);

  // Calculate player positions around the circle
  const positionedPlayers = useMemo(() => {
    const totalPlayers = playerData.length;

    // Find current player index
    const currentPlayerIndex = playerData.findIndex((player) => player.isCurrentPlayer);

    return playerData.map((player, index) => {
      // Calculate rotation in degrees
      let rotation = 90; // Default position for current player

      if (!player.isCurrentPlayer) {
        // Calculate positions for other players to distribute them around the circle
        // Get the relative position from current player
        const relativeIndex = (index - currentPlayerIndex + totalPlayers) % totalPlayers;
        // Calculate degrees per player and distribute
        const degreesPerPlayer = 360 / totalPlayers;
        // Calculate rotation, ensuring current player stays at 90 degrees
        rotation = (90 + relativeIndex * degreesPerPlayer) % 360;
      }

      return {
        ...player,
        rotation,
      };
    });
  }, [playerData]);

  const handlePlayerPress = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowPlayerDetail(true);
    if (onPlayerPress) {
      onPlayerPress(playerId);
    }
  };

  const closePlayerDetail = () => {
    setShowPlayerDetail(false);
    setSelectedPlayerId(null);
  };

  // Format time remaining as minutes:seconds
  const formatTimeRemaining = () => {
    const minutes = Math.floor(turnTimeRemaining / 60);
    const seconds = turnTimeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Is it the current user's turn?
  const isCurrentUserTurn = currentTurnPlayerId === currentPlayerId;

  // Get the selected player data
  const selectedPlayer = selectedPlayerId
    ? playerData.find((player) => player.id === selectedPlayerId)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Header />

      {/* Game controls */}
      <View className="mb-4 px-3">
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

      {/* Circular Game Board */}
      <View className="flex-1 items-center justify-center ">
        {/* Central Game Area */}
        <TouchableOpacity
          style={[styles.gameCenter, { width: CIRCLE_RADIUS * 1.2, height: CIRCLE_RADIUS * 1.2 }]}
          className="items-center justify-center rounded-full border-4 border-gray-700 bg-gray-800"
          onPress={onCenterPress}>
          {/* Enhanced game table with design elements */}
          <View className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30" />
          <View className="absolute inset-8 rounded-full border-2 border-gray-500 opacity-20" />

          <View className="items-center justify-center">
            <Text className="text-lg font-bold text-white">Game Cards: {gameCards.length}</Text>
            <Text className="text-xs text-gray-400">Tap to view game table</Text>

            {/* If there are game cards, show a small stack representation */}
            {gameCards.length > 0 && (
              <View className="mt-2 h-20 w-14 items-center justify-center">
                {Array.from({ length: Math.min(3, gameCards.length) }).map((_, index) => (
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
                      transform: [{ rotate: `${(index - 1) * 5}deg` }, { translateY: -index * 2 }],
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Players positioned around the circle */}
        {positionedPlayers.map((player) => {
          // Calculate position based on angle
          const angle = (player.rotation * Math.PI) / 180;
          const x = CIRCLE_RADIUS * Math.cos(angle);
          const y = CIRCLE_RADIUS * Math.sin(angle);

          // Is it this player's turn?
          const isPlayerTurn = player.id === currentTurnPlayerId;

          return (
            <View
              key={player.id}
              style={[
                styles.playerPosition,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}>
              <PlayerInformation
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
                isPlayerTurn={isPlayerTurn}
                onPress={handlePlayerPress}
              />
            </View>
          );
        })}
      </View>

      {/* Player Detail Screen (Modal) */}
      {showPlayerDetail && selectedPlayer && (
        <PlayerDetailScreen
          playerName={selectedPlayer.name}
          manaCards={selectedPlayer.cards.filter((card) => card.type === 'mana')}
          buffEffects={selectedPlayer.effects.filter((effect) => effect.type === 'buff')}
          debuffEffects={selectedPlayer.effects.filter((effect) => effect.type === 'debuff')}
          onClose={closePlayerDetail}
          onEffectPress={() => {}}
          playerAvatar={selectedPlayer.avatar}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gameCenter: {
    position: 'absolute',
    zIndex: 1,
  },
  playerPosition: {
    position: 'absolute',
    width: 110,
    height: 120,
    zIndex: 2,
    alignItems: 'center',
  },
});
