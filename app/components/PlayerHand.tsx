import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

import { BuffDebuff, EffectProps } from './BuffDebuff';
import { Card, CardProps } from './Card';

interface PlayerHandProps {
  playerName: string;
  manaCards: CardProps[];
  actionCards?: CardProps[];
  buffEffects?: EffectProps[];
  debuffEffects?: EffectProps[];
  onEffectPress?: (effect: EffectProps) => void;
  maxDisplayCards?: number;
}

export const PlayerHand = ({
  playerName,
  manaCards,
  actionCards = [],
  buffEffects = [],
  debuffEffects = [],
  onEffectPress,
  maxDisplayCards = 5,
}: PlayerHandProps) => {
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<EffectProps | null>(null);

  const handleCardPress = (card: CardProps) => {
    setSelectedCard(card);
  };

  const handleEffectPress = (effect: EffectProps) => {
    setSelectedEffect(effect);
    if (onEffectPress) {
      onEffectPress(effect);
    }
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const handleCloseEffectModal = () => {
    setSelectedEffect(null);
  };

  // Limit the number of cards shown
  const displayCards = actionCards.slice(0, maxDisplayCards);

  // Calculate offset for each card
  const cardOffset = 15; // pixels to offset each card

  return (
    <View className="flex-1">
      <View className="mb-3 rounded-xl bg-gray-800 p-3 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require('assets/image.png')}
              className="h-10 w-10 rounded-full border-2 border-amber-500"
            />
            <Text className="ml-2 text-lg font-bold text-white">{playerName}'s hand</Text>
          </View>

          <View className="flex-row space-x-3">
            {/* Health */}
            <View className="flex-row items-center">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-red-600">
                <Text className="text-xs font-bold text-white">❤️</Text>
              </View>
              <Text className="ml-1 font-bold text-red-400">{20}</Text>
            </View>

            {/* Mana Pool */}
            <View className="flex-row items-center">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                <Text className="text-xs font-bold text-white">⚡</Text>
              </View>
              <Text className="ml-1 font-bold text-blue-400">{20}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Effects Section (if there are any) */}
      {(buffEffects.length > 0 || debuffEffects.length > 0) && (
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
      )}

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
            <Card key={card.id} {...card} onPress={() => handleCardPress(card)} />
          ))}
        </ScrollView>
      </View>

      {/* Action Cards Section */}
      <View className="mb-2 flex-1">
        <View className="mb-1 rounded-lg bg-red-900 px-2 py-1">
          <Text className="font-semibold text-white">Action Cards ({actionCards.length})</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardContainer}>
          {displayCards.map((card, index) => (
            <Card key={card.id} {...card} onPress={() => handleCardPress(card)} />
          ))}
        </ScrollView>
      </View>

      {/* Card Detail Modal */}
      <Modal
        visible={selectedCard !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/70"
          activeOpacity={1}
          onPress={handleCloseModal}>
          <View className="w-4/5 items-center rounded-xl bg-gray-800 p-4">
            {selectedCard && (
              <>
                <Text className="mb-2 text-xl font-bold text-white">{selectedCard.name}</Text>

                {selectedCard.type === 'action' && (
                  <>
                    <Text className="mb-2 text-white">
                      {selectedCard.description || 'No description'}
                    </Text>
                    {selectedCard.cost !== undefined && (
                      <Text className="text-blue-400">Mana Cost: {selectedCard.cost}</Text>
                    )}
                    {selectedCard.power !== undefined && selectedCard.toughness !== undefined && (
                      <Text className="text-amber-400">
                        Power/Toughness: {selectedCard.power}/{selectedCard.toughness}
                      </Text>
                    )}
                  </>
                )}

                {selectedCard.type === 'mana' && (
                  <Text className="mb-2 text-white">
                    This card generates {selectedCard.manaColor} mana.
                  </Text>
                )}

                <View className="mt-4 flex-row">
                  <TouchableOpacity
                    className="mx-2 rounded-lg bg-blue-600 px-4 py-2"
                    onPress={handleCloseModal}>
                    <Text className="font-bold text-white">Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mx-2 rounded-lg bg-green-600 px-4 py-2"
                    onPress={handleCloseModal}>
                    <Text className="font-bold text-white">Play Card</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Effect Detail Modal */}
      <Modal
        visible={selectedEffect !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEffectModal}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/70"
          activeOpacity={1}
          onPress={handleCloseEffectModal}>
          <View className="w-4/5 items-center rounded-xl bg-gray-800 p-4">
            {selectedEffect && (
              <>
                <Text className="mb-2 text-xl font-bold text-white">
                  {selectedEffect.name} ({selectedEffect.type === 'buff' ? 'Buff' : 'Debuff'})
                </Text>

                <Text className="mb-4 text-center text-white">{selectedEffect.description}</Text>

                {selectedEffect.value !== undefined && (
                  <Text className="mb-2 text-lg font-bold text-white">
                    Effect Strength:{' '}
                    {selectedEffect.value > 0 ? `+${selectedEffect.value}` : selectedEffect.value}
                  </Text>
                )}

                <Text className="text-amber-400">
                  Duration:{' '}
                  {selectedEffect.duration === 'permanent'
                    ? 'Permanent'
                    : `${selectedEffect.turnsRemaining || selectedEffect.duration} turns`}
                </Text>

                <View className="mt-4 flex-row">
                  <TouchableOpacity
                    className="mx-2 rounded-lg bg-blue-600 px-4 py-2"
                    onPress={handleCloseEffectModal}>
                    <Text className="font-bold text-white">Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 5,
    paddingHorizontal: 5,
  },
  container: {
    position: 'relative',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: 40,
    height: 60,
    backgroundColor: '#6D28D9', // Purple color
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
});
