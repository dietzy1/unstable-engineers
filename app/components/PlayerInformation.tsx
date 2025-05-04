import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PlayerData } from 'screens/game/GameScreen';
import { AVATARS } from 'screens/lobby/GameSelectionScreen';

interface PlayerInformationProps {
  player: PlayerData;
  isCurrentPlayer: boolean;
  isPlayerTurn: boolean;
  onPress: (playerId: string) => void;
}

export const PlayerInformation = ({
  player,
  isCurrentPlayer,
  isPlayerTurn,
  onPress,
}: PlayerInformationProps) => {
  // Count buffs and debuffs
  const buffCount = player.effects.filter((effect) => effect.type === 'buff').length;
  const debuffCount = player.effects.filter((effect) => effect.type === 'debuff').length;

  return (
    <TouchableOpacity
      className={`rounded-lg p-2 ${
        isCurrentPlayer
          ? 'border-2 border-amber-500 bg-indigo-700'
          : isPlayerTurn
            ? 'border-2 border-amber-500 bg-gray-700'
            : 'bg-gray-700'
      }`}
      onPress={() => onPress(player.id)}>
      {/* Player Card - enhanced with avatar and more info */}
      <View className="items-center">
        {/* Active Turn Indicator */}
        {isPlayerTurn && (
          <View className="absolute -right-3 -top-3 h-6 w-6 items-center justify-center rounded-full bg-amber-500">
            <Text className="text-xs font-bold text-white">⏰</Text>
          </View>
        )}

        {/* Avatar */}
        <View
          className={`mb-1 h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 ${
            isCurrentPlayer
              ? 'border-amber-400'
              : isPlayerTurn
                ? 'border-amber-400'
                : 'border-gray-600'
          }`}>
          {player.avatar ? (
            <Image
              source={AVATARS.find((a) => a.id === player.avatar.replace('.png', ''))?.source}
              className="h-12 w-12"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-600">
              <Text className="text-lg font-bold text-white">{player.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Player Name */}
        <Text className="text-center text-sm font-bold text-white" numberOfLines={1}>
          {player.name}
        </Text>

        {/* Stats Row */}
        <View className="mt-1 flex-row justify-center space-x-2">
          {/* Life */}
          <View className="flex-row items-center">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-red-600">
              <Text className="text-xs font-bold text-white">❤️</Text>
            </View>
            <Text className="ml-0.5 text-xs text-white">{player.lifeTotal}</Text>
          </View>

          {/* Cards */}
          <View className="flex-row items-center">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-xs font-bold text-white">🃏</Text>
            </View>
            <Text className="ml-0.5 text-xs text-white">{player.cards.length}</Text>
          </View>
        </View>

        {/* Effects Row */}
        <View className="mt-1 flex-row justify-center space-x-2">
          {/* Buffs */}
          {buffCount > 0 && (
            <View className="flex-row items-center">
              <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                <Text className="text-xs font-bold text-white">⬆️</Text>
              </View>
              <Text className="ml-0.5 text-xs text-white">{buffCount}</Text>
            </View>
          )}

          {/* Debuffs */}
          {debuffCount > 0 && (
            <View className="flex-row items-center">
              <View className="h-5 w-5 items-center justify-center rounded-full bg-rose-600">
                <Text className="text-xs font-bold text-white">⬇️</Text>
              </View>
              <Text className="ml-0.5 text-xs text-white">{debuffCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
