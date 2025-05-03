import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CardInteractions } from './CardInteractions';

export type EffectType = 'buff' | 'debuff';
export type EffectDuration = number | 'permanent';

export interface EffectProps {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  duration: EffectDuration;
  value?: number;
  turnsRemaining?: number;
  onPress?: () => void;
}

export const BuffDebuff = ({
  name,
  type,
  description,
  duration,
  value,
  turnsRemaining,
  onPress,
}: EffectProps) => {
  const isBuff = type === 'buff';

  const getBgColor = () => {
    return isBuff ? 'bg-emerald-600' : 'bg-rose-600';
  };

  const getBorderColor = () => {
    return isBuff ? 'border-emerald-300' : 'border-rose-300';
  };

  const getDurationText = () => {
    if (duration === 'permanent') return 'Permanent';
    if (turnsRemaining !== undefined) return `${turnsRemaining} turns`;
    return `${duration} turns`;
  };

  return (
    <CardInteractions onPress={onPress}>
      <View
        className={`${getBgColor()} rounded-lg border ${getBorderColor()} m-1`}
        style={styles.effect}>
        {/* Effect name */}
        <View className="rounded-t-lg bg-black/30 p-1">
          <Text className="text-xs font-bold text-white">{name}</Text>
        </View>

        {/* Effect details */}
        <View className="flex-1 justify-center p-1">
          <Text className="text-xs text-white" numberOfLines={2}>
            {description}
          </Text>
          {value !== undefined && (
            <Text className="text-center text-xs font-bold text-white">
              {value > 0 ? `+${value}` : value}
            </Text>
          )}
        </View>

        {/* Duration */}
        <View className="rounded-b-lg bg-black/20 p-1">
          <Text className="text-center text-xs text-white">{getDurationText()}</Text>
        </View>
      </View>
    </CardInteractions>
  );
};

const styles = StyleSheet.create({
  effect: {
    width: 80,
    height: 100,
  },
});
