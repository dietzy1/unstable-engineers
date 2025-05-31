import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PlayerData } from 'screens/game/GameScreen';
import { ManaColor } from 'types/Card';
import { AVATARS } from 'screens/lobby/GameSelectionScreen';

interface PlayerStatsBarProps {
  player: PlayerData;
}

const MANA_COLORS: ManaColor[] = ['red', 'blue', 'green', 'black'];

const MANA_CONFIG: Record<ManaColor, { label: string; bg: string; icon: string; glow: string }> = {
  red: {
    label: 'Fire',
    bg: 'bg-red-600',
    icon: '🔥',
    glow: 'shadow-red-500/50',
  },
  blue: {
    label: 'Water',
    bg: 'bg-blue-600',
    icon: '💧',
    glow: 'shadow-blue-500/50',
  },
  green: {
    label: 'Nature',
    bg: 'bg-emerald-600',
    icon: '🌿',
    glow: 'shadow-emerald-500/50',
  },
  black: {
    label: 'Shadow',
    bg: 'bg-purple-800',
    icon: '🌙',
    glow: 'shadow-purple-500/50',
  },
};

export const PlayerStatsBar = ({ player }: PlayerStatsBarProps) => {
  const maxHealth = 20;
  const healthPercent = Math.max(0, Math.min(1, player.lifeTotal / maxHealth));

  const getHealthColor = () => {
    if (healthPercent > 0.6) return '#10B981'; // Green
    if (healthPercent > 0.3) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const healthColor = getHealthColor();

  const buffCount = player.effects.filter((e) => e.type === 'buff').length;
  const debuffCount = player.effects.filter((e) => e.type === 'debuff').length;

  const manaCounts: Record<ManaColor, number> = { red: 0, blue: 0, green: 0, black: 0 };
  player.cards.forEach((card) => {
    if (card.type === 'mana') {
      manaCounts[card.manaColor]++;
    }
  });

  const radius = 32;
  const strokeWidth = 5;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * (1 - healthPercent);

  return (
    <View className="absolute bottom-0 w-full items-center pb-4">
      <View className="w-full  rounded-t-2xl   bg-gray-900/80 px-4 pb-2 pt-4 shadow-2xl backdrop-blur-lg">
        <View className="flex-row items-center justify-between">
          {/* Left Side - Effects */}
          <View className="flex-1 items-center">
            <Text className="mb-2 text-xs font-bold uppercase text-slate-400">Effects</Text>
            <View className="flex-row">
              <View className="mr-2 items-center rounded-lg bg-emerald-900/80 px-3 py-1">
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text className="text-sm font-bold text-white">{buffCount}</Text>
              </View>
              <View className="items-center rounded-lg bg-red-900/80 px-3 py-1">
                <Ionicons name="trending-down" size={18} color="#EF4444" />
                <Text className="text-sm font-bold text-white">{debuffCount}</Text>
              </View>
            </View>
          </View>

          {/* Center - Avatar with Health Circle */}
          <View className="mx-4 items-center">
            <View className="relative h-20 w-20 items-center justify-center">
              <View className="absolute">
                <Svg width={80} height={80}>
                  <Defs>
                    <LinearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={healthColor} stopOpacity="1" />
                      <Stop offset="100%" stopColor={healthColor} stopOpacity="0.7" />
                    </LinearGradient>
                  </Defs>
                  <Circle
                    cx={40}
                    cy={40}
                    r={radius}
                    stroke="#374151"
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.4}
                  />
                  <Circle
                    cx={40}
                    cy={40}
                    r={radius}
                    stroke="url(#healthGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </Svg>
              </View>
              <Image
                source={AVATARS.find((a) => a.id === player.avatar.replace('.png', ''))?.source}
                className="h-14 w-14 rounded-full"
                resizeMode="cover"
              />
            </View>
            <Text className="mt-1 text-lg font-bold" style={{ color: healthColor }}>
              {player.lifeTotal} HP
            </Text>
          </View>

          {/* Right Side - Mana Resources */}
          <View className="flex-1 items-center">
            <Text className="mb-2 text-xs font-bold uppercase text-slate-400">Mana</Text>
            <View className="flex-row">
              {MANA_COLORS.map((color, index) => {
                const config = MANA_CONFIG[color];
                const count = manaCounts[color];
                return (
                  <View
                    key={color}
                    className={`items-center px-1 ${index < MANA_COLORS.length - 1 ? 'mr-1' : ''}`}>
                    <Text className="text-lg">{config.icon}</Text>
                    <Text className="text-sm font-bold text-white">{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
