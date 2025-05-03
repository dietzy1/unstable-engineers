import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import { CardInteractions } from './CardInteractions';

export type CardType = 'mana' | 'action';
export type ManaColor = 'red' | 'blue' | 'green' | 'black' | 'white' | 'colorless';

export interface CardProps {
  id: string;
  name: string;
  type: CardType;
  description?: string;
  cost?: number;
  power?: number;
  toughness?: number;
  image?: string;
  manaColor?: ManaColor;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const Card = ({
  name,
  type,
  description,
  cost,
  power,
  toughness,
  image,
  manaColor = 'colorless',
  onPress,
  onLongPress,
}: CardProps) => {
  const isMana = type === 'mana';

  // Background colors based on mana type
  const getBgColor = () => {
    if (!isMana) return 'bg-gray-700';

    switch (manaColor) {
      case 'red':
        return 'bg-red-500';
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'black':
        return 'bg-stone-800';
      case 'white':
        return 'bg-amber-50';
      default:
        return 'bg-gray-400';
    }
  };

  const getTextColor = () => {
    if (manaColor === 'white' || manaColor === 'colorless') return 'text-black';
    return 'text-white';
  };

  return (
    <CardInteractions onPress={onPress} onLongPress={onLongPress}>
      <View
        className={`mx-1 overflow-hidden rounded-lg ${getBgColor()} border border-gray-800`}
        style={styles.card}>
        {/* Card title */}
        <View className="border-b border-gray-800 p-1">
          <Text className={`text-xs font-bold ${getTextColor()}`}>{name}</Text>
        </View>

        {/* Card image/icon */}
        <View className="h-14 items-center justify-center">
          {image ? (
            <Image source={{ uri: image }} className="h-10 w-10" />
          ) : (
            <Text className={`text-lg font-bold ${getTextColor()}`}>
              {isMana ? manaColor[0].toUpperCase() : '?'}
            </Text>
          )}
        </View>

        {/* Card details */}
        {!isMana && (
          <View className="bg-black/20 p-1">
            <Text className={`text-xs ${getTextColor()}`} numberOfLines={2}>
              {description || 'No description'}
            </Text>

            {/* Power/Toughness for creature cards */}
            {power !== undefined && toughness !== undefined && (
              <View className="mt-1 flex-row justify-end">
                <Text className={`text-xs font-bold ${getTextColor()}`}>
                  {power}/{toughness}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Mana cost indicator */}
        {!isMana && cost !== undefined && (
          <View className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <Text className="text-xs font-bold text-white">{cost}</Text>
          </View>
        )}
      </View>
    </CardInteractions>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 120,
  },
});
