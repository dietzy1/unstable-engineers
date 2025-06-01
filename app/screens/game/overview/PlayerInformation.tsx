import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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

  // Calculate health percent
  const maxHealth = 20; // TODO: Replace with actual max if available
  const healthPercent = Math.max(0, Math.min(1, player.lifeTotal / maxHealth));

  // Circle configuration
  const radius = 18;
  const strokeWidth = 2.5;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * (1 - healthPercent);

  // Determine health color based on percentage
  const getHealthColor = () => {
    if (healthPercent > 0.6) return '#10B981'; // Green
    if (healthPercent > 0.3) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const healthColor = getHealthColor();

  return (
    <TouchableOpacity
      onPress={() => onPress(player.id)}
      className={`z-30 rounded-lg px-2 py-2 shadow-lg ${
        isCurrentPlayer
          ? 'border border-blue-400 bg-blue-900/80'
          : isPlayerTurn
            ? 'border border-yellow-400 bg-yellow-900/80'
            : 'border border-gray-600 bg-gray-900/90'
      }`}
      style={{ width: 105, height: 70 }}>
      {/* Player Name at the top */}
      <Text
        className={`mb-2 text-xs font-bold ${
          isCurrentPlayer ? 'text-blue-200' : isPlayerTurn ? 'text-yellow-200' : 'text-gray-100'
        }`}
        numberOfLines={1}>
        {player.name}
      </Text>

      {/* Bottom row with avatar and info */}
      <View className="flex-row items-center justify-between" style={{ height: 32 }}>
        {/* Avatar with Health Circle */}
        <View className="relative items-center justify-center">
          {/* Health Circle Background */}
          <View className="absolute">
            <Svg width={40} height={40}>
              {/* Background circle */}
              <Circle
                cx={20}
                cy={20}
                r={radius}
                stroke="#374151"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.4}
              />
              {/* Health progress circle */}
              <Circle
                cx={20}
                cy={20}
                r={radius}
                stroke={healthColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 20 20)" // Start from top
              />
            </Svg>
          </View>

          {/* Avatar centered in the circle */}
          <View className="items-center justify-center" style={{ width: 40, height: 40 }}>
            {player.avatar ? (
              <Image
                source={AVATARS.find((a) => a.id === player.avatar.replace('.png', ''))?.source}
                className="rounded-full"
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
              />
            ) : (
              <View
                className="items-center justify-center rounded-full bg-gray-700"
                style={{ width: 30, height: 30 }}>
                <MaterialCommunityIcons name="account" size={20} color="#FFF" />
              </View>
            )}
          </View>

          {/* Turn indicator */}
          {isPlayerTurn && (
            <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400" />
          )}
        </View>

        {/* Right side info */}
        <View className="ml-2 flex-1 items-end justify-center">
          {/* Health Points */}
          <Text className="mb-1 text-sm font-bold" style={{ color: healthColor }}>
            {player.lifeTotal}
          </Text>

          {/* Effects indicators (buffs/debuffs) */}
          {(buffCount > 0 || debuffCount > 0) && (
            <View className="flex-row items-center">
              {buffCount > 0 && (
                <View className="mr-1 flex-row items-center rounded-sm bg-green-600/80 px-1">
                  <Ionicons name="arrow-up" size={6} color="white" />
                  <Text className="ml-0.5 text-xs text-white">{buffCount}</Text>
                </View>
              )}
              {debuffCount > 0 && (
                <View className="flex-row items-center rounded-sm bg-red-600/80 px-1">
                  <Ionicons name="arrow-down" size={6} color="white" />
                  <Text className="ml-0.5 text-xs text-white">{debuffCount}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
