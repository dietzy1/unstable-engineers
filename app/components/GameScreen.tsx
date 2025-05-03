import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { PlayerHand } from './PlayerHand';
import { CardProps } from './Card';
import { LandscapeContainer } from './LandscapeContainer';

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
  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <View className="flex-1 p-2">
        {/* Game Header */}
        <View className="mb-2 rounded-lg bg-indigo-900 p-2">
          <Text className="text-center text-xl font-bold text-white">Unstable Engineers</Text>
        </View>

        {/* Game Status Bar */}
        <View className="mb-2 flex-row justify-between rounded-lg bg-gray-700 p-2">
          <Text className="text-white">Life: 20</Text>
          <Text className="text-white">Turn: 1</Text>
          <Text className="text-white">Cards: 43</Text>
        </View>

        {/* Player Hand */}
        <View className="flex-1 justify-end">
          <PlayerHand
            playerName="Player 1"
            manaCards={SAMPLE_MANA_CARDS}
            actionCards={SAMPLE_ACTION_CARDS}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
