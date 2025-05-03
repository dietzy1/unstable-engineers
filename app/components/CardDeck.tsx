import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { CardType, ManaColor } from './Card';

interface CardDeckProps {
  type: CardType;
  cardsRemaining: number;
  manaColor?: ManaColor;
  onPress?: () => void;
}

export const CardDeck = ({
  type,
  cardsRemaining,
  manaColor = 'colorless',
  onPress,
}: CardDeckProps) => {
  const isMana = type === 'mana';

  const getBgColor = () => {
    if (!isMana) return 'bg-gray-800';

    switch (manaColor) {
      case 'red':
        return 'bg-red-700';
      case 'blue':
        return 'bg-blue-700';
      case 'green':
        return 'bg-green-700';
      case 'black':
        return 'bg-stone-900';
      case 'white':
        return 'bg-amber-100';
      default:
        return 'bg-gray-600';
    }
  };

  const getTextColor = () => {
    if (manaColor === 'white') return 'text-black';
    return 'text-white';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className={`${getBgColor()} rounded-lg border-2 border-gray-900`} style={styles.deck}>
        {/* Create a stack effect with multiple layers */}
        <View className="absolute bottom-1 left-1 right-1 top-1 rounded-lg bg-black/10" />
        <View className="absolute bottom-2 left-2 right-2 top-2 rounded-lg bg-black/10" />

        <View className="flex-1 items-center justify-center">
          <Text className={`text-xl font-bold ${getTextColor()}`}>
            {isMana ? 'MANA' : 'ACTION'}
          </Text>
          <Text className={`text-lg ${getTextColor()}`}>{cardsRemaining}</Text>
          <Text className={`text-xs ${getTextColor()}`}>cards left</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deck: {
    width: 100,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
});
