import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

import { GameOverviewScreen } from './GameOverviewScreen';
import { PlayersOverviewScreen } from './PlayersOverviewScreen';
import { EffectProps } from '../../components/BuffDebuff';
import { CardProps } from '../../components/Card';
import { CardAddedNotification } from '../../components/CardAddedNotification';
import { PlayerHand } from '../../components/PlayerHand';
import { SwipeNavigation } from '../../components/SwipeNavigation';

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

// Sample mana cards for other players
const PLAYER2_MANA_CARDS: CardProps[] = [
  { id: 'p2m1', name: 'Island', type: 'mana', manaColor: 'blue' },
  { id: 'p2m2', name: 'Island', type: 'mana', manaColor: 'blue' },
  { id: 'p2m3', name: 'Island', type: 'mana', manaColor: 'blue' },
  { id: 'p2m4', name: 'Swamp', type: 'mana', manaColor: 'black' },
];

// Sample players
const PLAYERS = [
  { id: 'player1', name: 'Player 1', lifeTotal: 20 },
  { id: 'player2', name: 'Player 2', lifeTotal: 20 },
];

interface GameScreenProps {
  gameId: string;
  onLeaveGame: () => void;
}

export const GameScreen = ({ gameId, onLeaveGame }: GameScreenProps) => {
  // Game state
  const [manaCards, setManaCards] = useState<CardProps[]>(SAMPLE_MANA_CARDS);
  const [actionCards, setActionCards] = useState<CardProps[]>(SAMPLE_ACTION_CARDS);
  const [currentView, setCurrentView] = useState<'hand' | 'overview' | 'players'>('hand');
  const [lifeTotals, setLifeTotals] = useState<{ [playerId: string]: number }>({
    player1: 20,
    player2: 20,
  });

  // Effects state
  const [playerEffects, setPlayerEffects] = useState<{ [playerId: string]: EffectProps[] }>({
    player1: [], // Current player
    player2: [], // Other player
  });

  // Player mana cards state - track mana cards for all players
  const [playerManaCards, setPlayerManaCards] = useState<{ [playerId: string]: CardProps[] }>({
    player1: manaCards,
    player2: PLAYER2_MANA_CARDS,
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

  // Keep player1's mana cards in sync with the main state
  useEffect(() => {
    setPlayerManaCards((prev) => ({
      ...prev,
      player1: manaCards,
    }));
  }, [manaCards]);

  // Handler for navigation between views
  const navigateToHand = () => setCurrentView('hand');
  const navigateToOverview = () => setCurrentView('overview');
  const navigateToPlayers = () => setCurrentView('players');

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
    if (currentView === 'overview' || currentView === 'players') {
      navigateToHand();
    }
  };

  // Separate buffs and debuffs for current player (player1)
  const currentPlayerBuffs =
    playerEffects.player1?.filter((effect) => effect.type === 'buff') || [];
  const currentPlayerDebuffs =
    playerEffects.player1?.filter((effect) => effect.type === 'debuff') || [];

  // Prepare player data for players overview
  const playersData = PLAYERS.map((player) => ({
    id: player.id,
    name: player.name,
    manaCards: playerManaCards[player.id] || [],
    effects: playerEffects[player.id] || [],
    lifeTotal: lifeTotals[player.id],
  }));

  // Render the appropriate screen based on current view
  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <SwipeNavigation onSwipeUp={handleSwipeUp} onSwipeDown={handleSwipeDown}>
        {currentView === 'hand' ? (
          <View className="flex-1 p-2">
            {/* Game Header */}
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-indigo-900 p-2">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-white">Unstable Engineers</Text>
                <View className="ml-2 rounded bg-blue-600 px-2 py-0.5">
                  <Text className="text-xs text-white">Game #{gameId.slice(-4)}</Text>
                </View>
              </View>

              <View className="flex-row">
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-purple-600 px-4 py-1"
                  onPress={navigateToPlayers}>
                  <Text className="font-bold text-white">PLAYERS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-lg bg-amber-600 px-4 py-1"
                  onPress={navigateToOverview}>
                  <Text className="font-bold text-white">DRAW CARDS</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Game Status Bar with End Turn Button */}
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-700 p-2">
              <Text className="text-white">Life: {lifeTotals.player1}</Text>

              <View className="flex-row">
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-red-600 px-3 py-1"
                  onPress={onLeaveGame}>
                  <Text className="font-bold text-white">Leave Game</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-lg bg-indigo-600 px-3 py-1"
                  onPress={handleEndTurn}>
                  <Text className="font-bold text-white">End Turn</Text>
                </TouchableOpacity>
              </View>

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
        ) : currentView === 'overview' ? (
          <GameOverviewScreen
            onNavigateToHand={navigateToHand}
            onDrawManaCard={handleDrawManaCard}
            onDrawActionCard={handleDrawActionCard}
            onApplyEffect={handleApplyEffect}
            playerIds={PLAYERS.map((p) => p.id)}
            playerNames={PLAYERS.map((p) => p.name)}
          />
        ) : (
          <PlayersOverviewScreen
            players={playersData}
            onNavigateToHand={navigateToHand}
            onNavigateToGameOverview={navigateToOverview}
            onEffectPress={handleApplyEffect}
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
