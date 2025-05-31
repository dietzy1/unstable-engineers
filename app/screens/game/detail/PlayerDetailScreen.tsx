import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

import { BuffDebuff, EffectProps } from '../../../components/BuffDebuff';
import { Card } from '../../../components/Card';
import { MagicCard } from 'types/Card';

interface PlayerDetailScreenProps {
  playerName: string;
  manaCards: MagicCard[];
  buffEffects: EffectProps[];
  debuffEffects: EffectProps[];
  onClose: () => void;
  onEffectPress?: (effect: EffectProps) => void;
  playerAvatar?: string;
}

export const PlayerDetailScreen = ({
  playerName,
  manaCards,
  buffEffects,
  debuffEffects,
  onClose,
  onEffectPress,
  playerAvatar,
}: PlayerDetailScreenProps) => {
  const handleEffectPress = (effect: EffectProps) => {
    if (onEffectPress) {
      onEffectPress(effect);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      {/* Header with player avatar, name and close button */}
      <View className="mb-4 flex-row items-center justify-between rounded-lg bg-indigo-900 p-3">
        <View className="flex-row items-center">
          {/* Player Avatar */}
          <View className="mr-3 h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400 bg-gray-700">
            {playerAvatar ? (
              <Image
                source={typeof playerAvatar === 'string' ? { uri: playerAvatar } : playerAvatar}
                className="h-12 w-12"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-lg font-bold text-white">{playerName.charAt(0)}</Text>
            )}
          </View>
          <Text className="text-xl font-bold text-white">{playerName}</Text>
        </View>
        <TouchableOpacity className="rounded-lg bg-amber-600 px-4 py-1" onPress={onClose}>
          <Text className="font-bold text-white">CLOSE</Text>
        </TouchableOpacity>
      </View>

      {/* Effects Section */}
      <View className="mb-4">
        <View className="mb-1 rounded-lg bg-purple-900 px-2 py-1">
          <Text className="font-semibold text-white">
            Active Effects ({buffEffects.length + debuffEffects.length})
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardContainer}>
          {/* Buffs */}
          {buffEffects.map((effect) => (
            <BuffDebuff key={effect.id} {...effect} onPress={() => handleEffectPress(effect)} />
          ))}

          {/* Debuffs */}
          {debuffEffects.map((effect) => (
            <BuffDebuff key={effect.id} {...effect} onPress={() => handleEffectPress(effect)} />
          ))}
        </ScrollView>
      </View>

      {/* Mana Cards Section */}
      <View className="mb-4">
        <View className="mb-1 rounded-lg bg-blue-900 px-2 py-1">
          <Text className="font-semibold text-white">Mana Cards ({manaCards.length})</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardContainer}>
          {manaCards.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </ScrollView>
      </View>

      {/* Info about privacy */}
      <View className="mt-2 rounded-lg bg-gray-700 p-2">
        <Text className="text-center text-sm text-gray-300">
          Action cards are hidden to preserve game privacy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});
