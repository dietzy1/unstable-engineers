import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  // Health calculations
  const maxHealth = 20;
  const healthPercent = Math.max(0, Math.min(1, player.lifeTotal / maxHealth));

  const getHealthColor = () => {
    if (healthPercent > 0.6) return '#10B981'; // Green
    if (healthPercent > 0.3) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getHealthGlow = () => {
    if (healthPercent > 0.6) return 'shadow-emerald-500/60';
    if (healthPercent > 0.3) return 'shadow-amber-500/60';
    return 'shadow-red-500/60';
  };

  const healthColor = getHealthColor();
  const healthGlow = getHealthGlow();

  // Effects calculations
  const buffCount = player.effects.filter((e) => e.type === 'buff').length;
  const debuffCount = player.effects.filter((e) => e.type === 'debuff').length;

  // Mana calculations
  const manaCounts: Record<ManaColor, number> = { red: 0, blue: 0, green: 0, black: 0 };
  player.cards.forEach((card) => {
    if (card.type === 'mana') {
      manaCounts[card.manaColor]++;
    }
  });

  // Health circle configuration
  const radius = 22;
  const strokeWidth = 3;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * (1 - healthPercent);

  return (
    <View className=" w-full items-center">
      <View className="rounded-lg  border border-slate-700/50  px-4 py-2 shadow-xl backdrop-blur-sm">
        <View className="flex-row items-center justify-center">
          {/* Left Side - Effects */}
          <View className="mr-4 flex-row items-center">
            <View className="mr-1 rounded bg-emerald-600/90 px-2 py-1 shadow-sm shadow-emerald-500/30">
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={12} color="#ffffff" />
                <Text className="ml-1 text-xs font-bold text-white">{buffCount}</Text>
              </View>
            </View>
            <View className="rounded bg-red-600/90 px-2 py-1 shadow-sm shadow-red-500/30">
              <View className="flex-row items-center">
                <Ionicons name="trending-down" size={12} color="#ffffff" />
                <Text className="ml-1 text-xs font-bold text-white">{debuffCount}</Text>
              </View>
            </View>
          </View>

          {/* Center - Avatar with Health Circle */}
          <View className="mx-4 items-center">
            <View className="relative items-center justify-center">
              {/* Health Circle Background */}
              <View className="absolute">
                <Svg width={50} height={50}>
                  <Defs>
                    <LinearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={healthColor} stopOpacity="1" />
                      <Stop offset="100%" stopColor={healthColor} stopOpacity="0.7" />
                    </LinearGradient>
                  </Defs>
                  {/* Background circle */}
                  <Circle
                    cx={25}
                    cy={25}
                    r={radius}
                    stroke="#374151"
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.4}
                  />
                  {/* Health progress circle */}
                  <Circle
                    cx={25}
                    cy={25}
                    r={radius}
                    stroke="url(#healthGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 25 25)"
                  />
                </Svg>
              </View>

              {/* Avatar centered in the circle */}
              <View className="items-center justify-center" style={{ width: 50, height: 50 }}>
                {player.avatar ? (
                  <Image
                    source={AVATARS.find((a) => a.id === player.avatar.replace('.png', ''))?.source}
                    className="rounded-full"
                    style={{ width: 36, height: 36 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="items-center justify-center rounded-full bg-gray-700"
                    style={{ width: 36, height: 36 }}>
                    <MaterialCommunityIcons name="account" size={24} color="#FFF" />
                  </View>
                )}
              </View>
            </View>

            {/* Health Points below avatar */}
            <Text className="mt-1 text-sm font-bold" style={{ color: healthColor }}>
              {player.lifeTotal} HP
            </Text>
          </View>

          {/* Right Side - Mana Resources */}
          <View className="ml-4 flex-row items-center">
            {MANA_COLORS.map((color, index) => {
              const config = MANA_CONFIG[color];
              const count = manaCounts[color];
              const hasResource = count > 0;

              return (
                <View
                  key={color}
                  className={`
                    rounded border px-2 py-1
                    ${config.bg} 
                    ${hasResource ? `shadow-sm ${config.glow} border-white/20` : 'border-slate-600/30 opacity-60'}
                    ${index < MANA_COLORS.length - 1 ? 'mr-1' : ''}
                  `}>
                  <View className="items-center">
                    <Text className="text-xs">{config.icon}</Text>
                    <Text className="text-xs font-bold text-white">{count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
