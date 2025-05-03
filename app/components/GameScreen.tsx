import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayerHand } from './PlayerHand';
import { CardProps } from './Card';
import { GameOverviewScreen } from './GameOverviewScreen';
import { SwipeNavigation } from './SwipeNavigation';
import { CardAddedNotification } from './CardAddedNotification';
import { EffectProps } from './BuffDebuff';

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

// Sample players
const PLAYERS = [
  { id: 'player1', name: 'Player 1' },
  { id: 'player2', name: 'Player 2' },
];

export const GameScreen = () => {
  // Game state
  const [manaCards, setManaCards] = useState<CardProps[]>(SAMPLE_MANA_CARDS);
  const [actionCards, setActionCards] = useState<CardProps[]>(SAMPLE_ACTION_CARDS);
  const [currentView, setCurrentView] = useState<'hand' | 'overview'>('hand');

  // Effects state
  const [playerEffects, setPlayerEffects] = useState<{ [playerId: string]: EffectProps[] }>({
    player1: [], // Current player
    player2: [], // Other player
  });

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    cardName: '',
    type: 'action' as 'mana' | 'action',
  });

  // Effect notification
  const [effectNotification, setEffectNotification] = useState({
    visible: false,
    effectName: '',
    effectType: 'buff' as 'buff' | 'debuff',
  });

  // Handler for navigation between views
  const navigateToHand = () => setCurrentView('hand');
  const navigateToOverview = () => setCurrentView('overview');

  // Handlers to hide notifications
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const hideEffectNotification = () => {
    setEffectNotification((prev) => ({ ...prev, visible: false }));
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

  // Handler for applying effects
  const handleApplyEffect = (effect: EffectProps, playerId: string) => {
    setPlayerEffects((prev) => ({
      ...prev,
      [playerId]: [...(prev[playerId] || []), effect],
    }));

    // Show effect notification
    setEffectNotification({
      visible: true,
      effectName: effect.name,
      effectType: effect.type,
    });
  };

  // Handler for removing an effect
  const handleRemoveEffect = (effectId: string, playerId: string) => {
    setPlayerEffects((prev) => ({
      ...prev,
      [playerId]: prev[playerId].filter((effect) => effect.id !== effectId),
    }));
  };

  // Simulate turn progression to update effect durations
  const handleEndTurn = () => {
    // Update all effects that have turns remaining
    setPlayerEffects((prev) => {
      const newEffects = { ...prev };

      Object.keys(newEffects).forEach((playerId) => {
        newEffects[playerId] = newEffects[playerId]
          .map((effect) => {
            if (effect.duration !== 'permanent' && effect.turnsRemaining) {
              const newTurnsRemaining = effect.turnsRemaining - 1;

              // If effect has expired, remove it
              if (newTurnsRemaining <= 0) {
                return null;
              }

              return { ...effect, turnsRemaining: newTurnsRemaining };
            }
            return effect;
          })
          .filter(Boolean) as EffectProps[];
      });

      return newEffects;
    });
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

  // Separate buffs and debuffs for current player (player1)
  const currentPlayerBuffs =
    playerEffects.player1?.filter((effect) => effect.type === 'buff') || [];
  const currentPlayerDebuffs =
    playerEffects.player1?.filter((effect) => effect.type === 'debuff') || [];

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

            {/* Game Status Bar with End Turn Button */}
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-700 p-2">
              <Text className="text-white">Life: 20</Text>
              <TouchableOpacity
                className="rounded-lg bg-indigo-600 px-3 py-1"
                onPress={handleEndTurn}>
                <Text className="font-bold text-white">End Turn</Text>
              </TouchableOpacity>
              <Text className="text-white">Cards: {manaCards.length + actionCards.length}</Text>
            </View>

            {/* Swipe Hint */}
            <View className="mb-2 items-center">
              <Text className="text-xs text-gray-400">Swipe up for card table</Text>
            </View>

            {/* Player Hand */}
            <View className="flex-1 justify-end">
              <PlayerHand
                playerName="Player 1"
                manaCards={manaCards}
                actionCards={actionCards}
                buffEffects={currentPlayerBuffs}
                debuffEffects={currentPlayerDebuffs}
                onEffectPress={(effect) => {
                  if (effect.type === 'debuff') {
                    // Allow removal of debuffs (simulating dispel)
                    handleRemoveEffect(effect.id, 'player1');
                  }
                }}
              />
            </View>
          </View>
        ) : (
          <GameOverviewScreen
            onNavigateToHand={navigateToHand}
            onDrawManaCard={handleDrawManaCard}
            onDrawActionCard={handleDrawActionCard}
            onApplyEffect={handleApplyEffect}
            playerIds={PLAYERS.map((p) => p.id)}
            playerNames={PLAYERS.map((p) => p.name)}
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

      {/* Effect Notification */}
      {effectNotification.visible && (
        <View
          className={`absolute bottom-24 self-center rounded-lg p-2 ${
            effectNotification.effectType === 'buff' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}>
          <Text className="font-bold text-white">
            {effectNotification.effectType === 'buff' ? 'Buff' : 'Debuff'} Applied
          </Text>
          <Text className="text-sm text-white">{effectNotification.effectName}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};
