import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayerHand } from './PlayerHand';
import { CardProps } from './Card';
import { GameOverviewScreen } from './GameOverviewScreen';
import { SwipeNavigation } from './SwipeNavigation';
import { CardAddedNotification } from './CardAddedNotification';

// Sample data for demonstration
const SAMPLE_MANA_CARDS: CardProps[] = [
  { id: 'm1', name: 'Mountain', type: 'mana', manaColor: 'red' },
  { id: 'm2', name: 'Island', type: 'mana', manaColor: 'blue' },
  { id: 'm3', name: 'Forest', type: 'mana', manaColor: 'green' },
  { id: 'm4', name: 'Swamp', type: 'mana', manaColor: 'black' },
  { id: 'm5', name: 'Plains', type: 'mana', manaColor: 'white' },
  { id: 'm6', name: 'Wastes', type: 'mana', manaColor: 'colorless' },
];

const SAMPLE_ACTION_CARDS: CardProps[] = [
  {
    id: 'a1',
    name: 'Fire Bolt',
    type: 'action',
    description: 'Deal 3 damage to any target',
    cost: 2,
  },
  {
    id: 'a2',
    name: 'Counterspell',
    type: 'action',
    description: 'Counter target spell',
    cost: 3,
  },
  {
    id: 'a3',
    name: 'Giant Growth',
    type: 'action',
    description: 'Target creature gets +3/+3 until end of turn',
    cost: 1,
  },
  {
    id: 'a4',
    name: 'Dragon',
    type: 'action',
    description: 'Flying',
    cost: 5,
    power: 5,
    toughness: 5,
  },
  {
    id: 'a5',
    name: 'Healing Salve',
    type: 'action',
    description: 'Gain 3 life or prevent 3 damage',
    cost: 1,
  },
];

export const GameScreen = () => {
  // Game state
  const [manaCards, setManaCards] = useState<CardProps[]>(SAMPLE_MANA_CARDS);
  const [actionCards, setActionCards] = useState<CardProps[]>(SAMPLE_ACTION_CARDS);
  const [currentView, setCurrentView] = useState<'hand' | 'overview'>('hand');

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    cardName: '',
    type: 'action' as 'mana' | 'action',
  });

  // Handler for navigation between views
  const navigateToHand = () => setCurrentView('hand');
  const navigateToOverview = () => setCurrentView('overview');

  // Handler to hide notification
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  // Handlers for drawing cards
  const handleDrawManaCard = (card: CardProps) => {
    setManaCards((prev) => [...prev, { ...card, id: `mana-${Date.now()}` }]);
    // Show notification
    setNotification({
      visible: true,
      cardName: card.name,
      type: 'mana',
    });
    // Navigate to hand after drawing
    navigateToHand();
  };

  const handleDrawActionCard = (card: CardProps) => {
    setActionCards((prev) => [...prev, { ...card, id: `action-${Date.now()}` }]);
    // Show notification
    setNotification({
      visible: true,
      cardName: card.name,
      type: 'action',
    });
    // Navigate to hand after drawing
    navigateToHand();
  };

  // Handle swipe gestures
  const handleSwipeUp = () => {
    if (currentView === 'hand') {
      navigateToOverview();
    }
  };

  const handleSwipeDown = () => {
    if (currentView === 'overview') {
      navigateToHand();
    }
  };

  // Render the PlayerHand or GameOverviewScreen based on current view
  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <SwipeNavigation onSwipeUp={handleSwipeUp} onSwipeDown={handleSwipeDown}>
        {currentView === 'hand' ? (
          <View className="flex-1 p-2">
            {/* Game Header */}
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-indigo-900 p-2">
              <Text className="text-center text-xl font-bold text-white">Unstable Engineers</Text>

              {/* Navigation button */}
              <TouchableOpacity
                className="rounded-lg bg-amber-600 px-4 py-1"
                onPress={navigateToOverview}>
                <Text className="font-bold text-white">DRAW CARDS</Text>
              </TouchableOpacity>
            </View>

            {/* Game Status Bar */}
            <View className="mb-2 flex-row justify-between rounded-lg bg-gray-700 p-2">
              <Text className="text-white">Life: 20</Text>
              <Text className="text-white">Turn: 1</Text>
              <Text className="text-white">Cards: {manaCards.length + actionCards.length}</Text>
            </View>

            {/* Swipe Hint */}
            <View className="mb-2 items-center">
              <Text className="text-xs text-gray-400">Swipe up for card table</Text>
            </View>

            {/* Player Hand */}
            <View className="flex-1 justify-end">
              <PlayerHand playerName="Player 1" manaCards={manaCards} actionCards={actionCards} />
            </View>
          </View>
        ) : (
          <GameOverviewScreen
            onNavigateToHand={navigateToHand}
            onDrawManaCard={handleDrawManaCard}
            onDrawActionCard={handleDrawActionCard}
          />
        )}
      </SwipeNavigation>

      {/* Card Added Notification */}
      <CardAddedNotification
        visible={notification.visible}
        cardName={notification.cardName}
        type={notification.type}
        onHide={hideNotification}
      />
    </SafeAreaView>
  );
};
