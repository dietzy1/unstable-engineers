import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { CardProps } from './Card';
import { EffectProps } from './BuffDebuff';
import { CardHand } from './CardHand';
import { PlayerDetailScreen } from 'screens/game/PlayerDetailScreen';
import { Header } from './Header';

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');
const CIRCLE_RADIUS = Math.min(width, height) * 0.35;

interface PlayerPosition {
  id: string;
  name: string;
  lifeTotal: number;
  effects: EffectProps[];
  cards: CardProps[];
  rotation: number; // Position in degrees around the circle
  isCurrentPlayer: boolean;
}

interface GameTableProps {
  playerData: PlayerPosition[];
  currentPlayerId: string;
  onPlayerPress: (playerId: string) => void;
  onCenterPress: () => void;
  onLeaveGame: () => void;
  gameCards: CardProps[];
}

export const GameTable = ({
  playerData,
  currentPlayerId,
  onPlayerPress,
  onCenterPress,
  onLeaveGame,
  gameCards = [],
}: GameTableProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);

  // Always position the current player at the bottom (270 degrees)
  const adjustedPlayerData = playerData.map((player) => ({
    ...player,
    rotation: player.isCurrentPlayer ? 270 : player.rotation,
  }));

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

  // Get the selected player data
  const selectedPlayer = selectedPlayerId
    ? playerData.find((player) => player.id === selectedPlayerId)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Header />

      {/* Game controls */}
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity className="rounded-lg bg-red-600 px-3 py-2" onPress={onLeaveGame}>
          <Text className="font-bold text-white">Leave Game</Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-lg bg-indigo-600 px-3 py-2">
          <Text className="font-bold text-white">End Turn</Text>
        </TouchableOpacity>
      </View>

      {/* Circular Game Board */}
      <View className="flex-1 items-center justify-center">
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
        {adjustedPlayerData.map((player) => {
          // Calculate position based on angle
          const angle = (player.rotation * Math.PI) / 180;
          const x = CIRCLE_RADIUS * Math.cos(angle);
          const y = CIRCLE_RADIUS * Math.sin(angle);

          // Get action cards for this player
          const actionCards = player.cards.filter((card) => card.type === 'action');

          return (
            <View
              key={player.id}
              style={[
                styles.playerPosition,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}>
              <TouchableOpacity
                className={`items-center justify-center rounded-lg p-2 ${
                  player.isCurrentPlayer ? 'border-2 border-amber-500 bg-indigo-700' : 'bg-gray-700'
                }`}
                onPress={() => handlePlayerPress(player.id)}>
                <View style={styles.playerContent}>
                  <Text className="font-bold text-white">{player.name}</Text>
                  <View className="mt-1 flex-row items-center">
                    <View className="mr-1 h-5 w-5 items-center justify-center rounded-full bg-red-600">
                      <Text className="text-xs font-bold text-white">❤️</Text>
                    </View>
                    <Text className="text-white">{player.lifeTotal}</Text>
                  </View>
                  <View className="mt-1 flex-row items-center">
                    <View className="mr-1 h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                      <Text className="text-xs font-bold text-white">🃏</Text>
                    </View>
                    <Text className="text-white">{player.cards.length}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Card Hand below the player */}
              {actionCards.length > 0 && <CardHand cards={player.cards} maxDisplayCards={5} />}
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
    width: 100,
    height: 120,
    zIndex: 2,
    alignItems: 'center',
  },
  playerContent: {
    alignItems: 'center',
  },
});
