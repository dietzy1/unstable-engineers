import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';

import { EffectProps } from '../../components/BuffDebuff';
import { Card } from '../../components/Card';
import { CardDeck } from '../../components/CardDeck';
import { EffectsManager } from '../../components/EffectsManager';

import { MagicCard } from 'types/Card';

// Sample data for available cards to draw
const AVAILABLE_DRAW_CARDS: MagicCard[] = [
  {
    id: 'd1',
    name: 'Fire Bolt',
    type: 'action',
    description: 'Deal 3 damage to any target',
    cost: 1,
    image: '',
    manaColor: 'red',
    onPress: () => {},
  },
  {
    id: 'd2',
    name: 'Goblin Guide',
    type: 'action',
    description: 'Haste',
    cost: 1,
    image: '',
    manaColor: 'red',
    onPress: () => {},
  },
  {
    id: 'd3',
    name: 'Wrath of God',
    type: 'action',
    description: 'Destroy all creatures',
    cost: 4,
    image: '',
    manaColor: 'black',
    onPress: () => {},
  },
  {
    id: 'd4',
    name: 'Llanowar Elves',
    type: 'action',
    description: 'Add one green mana',
    cost: 1,
    image: '',
    manaColor: 'green',
    onPress: () => {},
  },
  {
    id: 'd5',
    name: 'Ancestral Recall',
    type: 'action',
    description: 'Draw three cards',
    cost: 1,
    image: '',
    manaColor: 'blue',
    onPress: () => {},
  },
];

interface GameOverviewScreenProps {
  onNavigateToHand: () => void;
  onDrawManaCard?: (card: MagicCard) => void;
  onDrawActionCard?: (card: MagicCard) => void;
  onApplyEffect?: (effect: EffectProps, playerId: string) => void;
  playerIds: string[];
  playerNames: string[];
}

export const GameOverviewScreen = ({
  onNavigateToHand,
  onDrawManaCard,
  onDrawActionCard,
  onApplyEffect,
  playerIds = [],
  playerNames = [],
}: GameOverviewScreenProps) => {
  const [selectedCard, setSelectedCard] = useState<MagicCard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEffectsManager, setShowEffectsManager] = useState(false);

  const handleCardPress = (card: MagicCard) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleAddCardToHand = () => {
    if (!selectedCard) return;

    if (selectedCard.type === 'mana' && onDrawManaCard) {
      onDrawManaCard(selectedCard);
    } else if (selectedCard.type === 'action' && onDrawActionCard) {
      onDrawActionCard(selectedCard);
    }

    handleCloseModal();
  };

  const handleDrawManaCard = () => {
    // Logic to draw a mana card would go here
    if (onDrawManaCard) {
      const randomColor = ['red', 'blue', 'green', 'black', 'white', 'colorless'][
        Math.floor(Math.random() * 6)
      ];
      const newManaCard: MagicCard = {
        id: `mana-${Date.now()}`,
        name: `${randomColor.charAt(0).toUpperCase() + randomColor.slice(1)} Mana`,
        type: 'mana',
        manaColor: randomColor as any,
        description: '',
        cost: 0,
        image: '',
        onPress: () => {},
      };
      onDrawManaCard(newManaCard);
    }
  };

  const handleDrawActionCard = () => {
    // Logic to draw an action card would go here
    if (onDrawActionCard && AVAILABLE_DRAW_CARDS.length > 0) {
      const randomIndex = Math.floor(Math.random() * AVAILABLE_DRAW_CARDS.length);
      onDrawActionCard(AVAILABLE_DRAW_CARDS[randomIndex]);
    }
  };

  const handleApplyEffect = (effect: EffectProps, playerId: string) => {
    if (onApplyEffect) {
      onApplyEffect(effect, playerId);
    }
  };

  const toggleEffectsManager = () => {
    setShowEffectsManager(!showEffectsManager);
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-2">
        {/* Game Header */}
        <View className="mb-2 flex-row items-center justify-between rounded-lg bg-indigo-900 p-2">
          <Text className="text-xl font-bold text-white">Card Table</Text>

          {/* Navigation Button */}
          <TouchableOpacity
            className="rounded-lg bg-amber-600 px-4 py-1"
            onPress={onNavigateToHand}>
            <Text className="font-bold text-white">MY HAND</Text>
          </TouchableOpacity>
        </View>

        {/* Game Status Bar with Effects Button */}
        <View className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-700 p-2">
          <Text className="text-white">Turn: 1</Text>
          <TouchableOpacity
            className="rounded-lg bg-purple-700 px-3 py-1"
            onPress={toggleEffectsManager}>
            <Text className="font-bold text-white">
              {showEffectsManager ? 'Hide Effects' : 'Show Effects'}
            </Text>
          </TouchableOpacity>
          <Text className="text-white">Players: {playerNames.length}</Text>
        </View>

        {/* Effects Manager (conditional) */}
        {showEffectsManager && (
          <View className="mb-2">
            <EffectsManager
              onApplyEffect={handleApplyEffect}
              playerIds={playerIds}
              playerNames={playerNames}
            />
          </View>
        )}

        {/* Card Draw Area */}
        <View className="flex-1 flex-row items-center justify-between">
          {/* Action Deck */}
          <View className="items-center">
            <CardDeck type="action" cardsRemaining={20} onPress={handleDrawActionCard} />
            <Text className="mt-2 text-sm text-gray-300">Action Deck</Text>
          </View>

          {/* Center Cards */}
          <View className="mx-4 flex-1">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}>
              {AVAILABLE_DRAW_CARDS.map((card) => (
                <Card key={card.id} {...card} onPress={() => handleCardPress(card)} />
              ))}
            </ScrollView>
          </View>

          {/* Mana Deck */}
          <View className="items-center">
            <CardDeck
              type="mana"
              cardsRemaining={30}
              manaColor="blue"
              onPress={handleDrawManaCard}
            />
            <Text className="mt-2 text-sm text-gray-300">Mana Deck</Text>
          </View>
        </View>
      </View>

      {/* Card Detail Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleCloseModal}>
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
                    onPress={handleAddCardToHand}>
                    <Text className="font-bold text-white">Add to Hand</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardList: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});
