import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CardProps } from './Card';
import { EffectProps } from './BuffDebuff';
import { PlayerDetailView } from './PlayerDetailView';

interface PlayerData {
  id: string;
  name: string;
  manaCards: CardProps[];
  effects: EffectProps[];
  lifeTotal?: number;
}

interface PlayersOverviewScreenProps {
  players: PlayerData[];
  onNavigateToHand: () => void;
  onNavigateToGameOverview: () => void;
  onEffectPress?: (effect: EffectProps, playerId: string) => void;
}

export const PlayersOverviewScreen = ({
  players,
  onNavigateToHand,
  onNavigateToGameOverview,
  onEffectPress,
}: PlayersOverviewScreenProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  const handlePlayerSelect = (player: PlayerData) => {
    setSelectedPlayer(player);
  };

  const closePlayerDetail = () => {
    setSelectedPlayer(null);
  };

  const handleEffectPress = (effect: EffectProps) => {
    if (selectedPlayer && onEffectPress) {
      onEffectPress(effect, selectedPlayer.id);
    }
  };

  return (
    <View className="flex-1 bg-gray-800 p-2">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-between rounded-lg bg-indigo-900 p-2">
        <Text className="text-xl font-bold text-white">Players</Text>

        <View className="flex-row">
          <TouchableOpacity
            className="mr-2 rounded-lg bg-purple-600 px-4 py-1"
            onPress={onNavigateToGameOverview}>
            <Text className="font-bold text-white">CARDS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg bg-amber-600 px-4 py-1"
            onPress={onNavigateToHand}>
            <Text className="font-bold text-white">MY HAND</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Hint */}
      <View className="mb-2 items-center">
        <Text className="text-xs text-gray-400">Tap on a player to view details</Text>
      </View>

      {/* Players List */}
      <ScrollView className="flex-1">
        {players.map((player) => (
          <TouchableOpacity
            key={player.id}
            className="mb-3 rounded-lg bg-gray-700 p-3"
            onPress={() => handlePlayerSelect(player)}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{player.name}</Text>

              {player.lifeTotal !== undefined && (
                <View className="rounded-lg bg-red-700 px-2 py-1">
                  <Text className="font-bold text-white">Life: {player.lifeTotal}</Text>
                </View>
              )}
            </View>

            {/* Quick Stats */}
            <View className="mt-2 flex-row">
              <View className="mr-3 rounded bg-blue-900 px-2 py-1">
                <Text className="text-sm text-white">Mana: {player.manaCards.length}</Text>
              </View>

              <View className="rounded bg-purple-900 px-2 py-1">
                <Text className="text-sm text-white">Effects: {player.effects.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Player Detail Modal */}
      <Modal
        visible={selectedPlayer !== null}
        transparent={false}
        animationType="slide"
        onRequestClose={closePlayerDetail}>
        {selectedPlayer && (
          <PlayerDetailView
            playerName={selectedPlayer.name}
            manaCards={selectedPlayer.manaCards}
            buffEffects={selectedPlayer.effects.filter((e) => e.type === 'buff')}
            debuffEffects={selectedPlayer.effects.filter((e) => e.type === 'debuff')}
            onClose={closePlayerDetail}
            onEffectPress={handleEffectPress}
          />
        )}
      </Modal>
    </View>
  );
};
