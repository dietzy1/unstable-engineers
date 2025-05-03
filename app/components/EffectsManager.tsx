import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BuffDebuff, EffectProps } from './BuffDebuff';

// Sample available effects
export const AVAILABLE_EFFECTS: EffectProps[] = [
  {
    id: 'buff1',
    name: 'Strength',
    type: 'buff',
    description: 'Increases attack power by 2',
    duration: 3,
    value: 2,
  },
  {
    id: 'buff2',
    name: 'Protection',
    type: 'buff',
    description: 'Prevents the next 3 damage',
    duration: 3,
    value: 3,
  },
  {
    id: 'buff3',
    name: 'Regeneration',
    type: 'buff',
    description: 'Recover 1 health each turn',
    duration: 'permanent',
    value: 1,
  },
  {
    id: 'debuff1',
    name: 'Poison',
    type: 'debuff',
    description: 'Take 1 damage each turn',
    duration: 4,
    value: -1,
  },
  {
    id: 'debuff2',
    name: 'Weakness',
    type: 'debuff',
    description: 'Reduces attack power by 1',
    duration: 2,
    value: -1,
  },
  {
    id: 'debuff3',
    name: 'Stun',
    type: 'debuff',
    description: 'Skip your next turn',
    duration: 1,
  },
];

interface EffectsManagerProps {
  onApplyEffect: (effect: EffectProps, playerId: string) => void;
  playerIds: string[];
  playerNames: string[];
}

export const EffectsManager = ({ onApplyEffect, playerIds, playerNames }: EffectsManagerProps) => {
  const [selectedEffect, setSelectedEffect] = useState<EffectProps | null>(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);

  const handleEffectSelect = (effect: EffectProps) => {
    setSelectedEffect(effect);
    setShowPlayerSelection(true);
  };

  const handleApplyEffect = (playerId: string, playerIndex: number) => {
    if (!selectedEffect) return;

    // Create a copy with a unique ID
    const effectToApply = {
      ...selectedEffect,
      id: `${selectedEffect.id}-${Date.now()}`,
      turnsRemaining: selectedEffect.duration === 'permanent' ? undefined : selectedEffect.duration,
    };

    onApplyEffect(effectToApply, playerId);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowPlayerSelection(false);
    setSelectedEffect(null);
  };

  return (
    <View className="rounded-lg bg-gray-900 p-2">
      <Text className="mb-2 text-center text-lg font-bold text-white">Effects</Text>

      <View className="flex-row">
        <View className="flex-1">
          <Text className="mb-1 font-semibold text-emerald-400">Buffs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.effectContainer}>
            {AVAILABLE_EFFECTS.filter((e) => e.type === 'buff').map((effect) => (
              <BuffDebuff key={effect.id} {...effect} onPress={() => handleEffectSelect(effect)} />
            ))}
          </ScrollView>
        </View>

        <View className="flex-1">
          <Text className="mb-1 font-semibold text-rose-400">Debuffs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.effectContainer}>
            {AVAILABLE_EFFECTS.filter((e) => e.type === 'debuff').map((effect) => (
              <BuffDebuff key={effect.id} {...effect} onPress={() => handleEffectSelect(effect)} />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Player Selection Modal */}
      <Modal
        visible={showPlayerSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/70"
          activeOpacity={1}
          onPress={handleCloseModal}>
          <View className="w-4/5 rounded-xl bg-gray-800 p-4">
            <Text className="mb-4 text-center text-lg font-bold text-white">
              Apply {selectedEffect?.name} to which player?
            </Text>

            {playerIds.map((playerId, index) => (
              <TouchableOpacity
                key={playerId}
                className="my-1 rounded-lg bg-indigo-700 p-2"
                onPress={() => handleApplyEffect(playerId, index)}>
                <Text className="text-center font-bold text-white">{playerNames[index]}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-4 rounded-lg bg-gray-600 p-2"
              onPress={handleCloseModal}>
              <Text className="text-center font-bold text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  effectContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});
