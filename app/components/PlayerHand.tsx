import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card, CardProps } from './Card';

interface PlayerHandProps {
  playerName: string;
  manaCards: CardProps[];
  actionCards: CardProps[];
}

export const PlayerHand = ({ playerName, manaCards, actionCards }: PlayerHandProps) => {
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);

  const handleCardPress = (card: CardProps) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <View className="flex-1">
      <View className="mb-2 rounded-lg bg-gray-900 p-2">
        <Text className="text-lg font-bold text-white">{playerName}'s Hand</Text>
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
          {actionCards.map((card) => (
            <Card key={card.id} {...card} onPress={() => handleCardPress(card)} />
          ))}
        </ScrollView>
      </View>

      {/* Card Detail Modal */}
      <Modal
        visible={selectedCard !== null}
        transparent={true}
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
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});
