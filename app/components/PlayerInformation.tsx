import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
      onPress={() => onPress(player.id)}
      className={` rounded-lg py-2 shadow-lg ${
        isCurrentPlayer ? 'bg-indigo-900' : isPlayerTurn ? 'bg-amber-900' : 'bg-gray-800'
      }`}
      style={{
        borderWidth: isCurrentPlayer || isPlayerTurn ? 2 : 0,
        borderColor: isCurrentPlayer || isPlayerTurn ? '#FFC107' : 'transparent',
      }}>
      {/* Player Turn Indicator */}
      {isPlayerTurn && (
        <View className="absolute -right-3 -top-3 h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-md">
          <Text className="text-xs font-bold text-white">⏰</Text>
        </View>
      )}

      <View className="items-center">
        {/* Avatar Frame with decorative elements */}
        <View className="relative mb-1">
          <View className="absolute -bottom-1 -left-1 -right-1 -top-1 rounded-full bg-amber-600 opacity-50" />
          <View
            className={`h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2
            ${isCurrentPlayer || isPlayerTurn ? 'border-amber-400' : 'border-gray-600'}`}>
            {player.avatar ? (
              <Image
                source={AVATARS.find((a) => a.id === player.avatar.replace('.png', ''))?.source}
                className="h-12 w-12"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-700">
                <MaterialCommunityIcons name="account" size={32} color="#FFF" />
              </View>
            )}
          </View>
        </View>

        {/* Player Name */}
        <View className="mb-2 min-w-full rounded-md bg-indigo-700 px-3 py-1">
          <Text className="text-center text-xs font-bold text-amber-100" numberOfLines={1}>
            {player.name}
          </Text>
        </View>

        {/* Stats Row */}
        <View className="mt-1 w-full flex-row justify-around">
          {/* Life */}
          <View className="items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full border border-red-300 bg-red-800 shadow-md">
              <FontAwesome5 name="heart" size={16} color="#FFF" />
            </View>
            <View className="-mt-2 rounded-full border border-red-700 bg-red-900/80 px-3">
              <Text className="font-bold text-red-100">{player.lifeTotal}</Text>
            </View>
          </View>

          {/* Cards */}
          <View className="items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full border border-blue-300  bg-blue-800 shadow-md">
              <MaterialCommunityIcons name="cards" size={16} color="#FFF" />
            </View>
            <View className="-mt-2 rounded-full border border-blue-700 bg-blue-900/80 px-3">
              <Text className="font-bold text-blue-100">{player.cards.length}</Text>
            </View>
          </View>
        </View>

        {/* Effects Row */}
        <View className="mt-3 w-full flex-row justify-around">
          {/* Buffs */}
          {buffCount > 0 && (
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-gradient-to-br from-emerald-500 to-emerald-800 shadow-md">
                <Ionicons name="arrow-up-circle" size={16} color="#FFF" />
              </View>
              <View className="-mt-1 rounded-full border border-emerald-700 bg-emerald-900/80 px-2">
                <Text className="text-xs font-bold text-emerald-100">{buffCount}</Text>
              </View>
            </View>
          )}

          {/* Debuffs */}
          {debuffCount > 0 && (
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full border border-rose-300 bg-gradient-to-br from-rose-500 to-rose-800 shadow-md">
                <Ionicons name="arrow-down-circle" size={16} color="#FFF" />
              </View>
              <View className="-mt-1 rounded-full border border-rose-700 bg-rose-900/80 px-2">
                <Text className="text-xs font-bold text-rose-100">{debuffCount}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
