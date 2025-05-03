import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

// Mock data for available games
const MOCK_GAMES = [
  { id: 'game1', name: 'Dragon Battle', host: 'Player1', players: 1, maxPlayers: 4 },
  { id: 'game2', name: 'Magic Duel', host: 'Wizard99', players: 2, maxPlayers: 2 },
  { id: 'game3', name: 'Tournament Room', host: 'GrandMaster', players: 3, maxPlayers: 8 },
  { id: 'game4', name: 'Casual Game', host: 'Newbie', players: 1, maxPlayers: 4 },
  { id: 'game5', name: 'Pro Match', host: 'Champion', players: 1, maxPlayers: 2 },
];

interface GameItemProps {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  onJoin: (gameId: string) => void;
}

// Component for individual game items in the list
const GameItem = ({ id, name, host, players, maxPlayers, onJoin }: GameItemProps) => {
  return (
    <TouchableOpacity
      className="mb-3 rounded-lg bg-gray-700 p-4"
      onPress={() => onJoin(id)}
      activeOpacity={0.7}>
      <View className="flex-row justify-between">
        <Text className="text-lg font-bold text-white">{name}</Text>
        <View className="rounded-lg bg-amber-600 px-2 py-1">
          <Text className="text-xs font-bold text-white">
            {players}/{maxPlayers} Players
          </Text>
        </View>
      </View>

      <Text className="mt-1 text-sm text-gray-300">Hosted by: {host}</Text>

      <View className="mt-3 flex-row justify-end">
        <TouchableOpacity className="rounded-lg bg-green-600 px-4 py-1" onPress={() => onJoin(id)}>
          <Text className="font-bold text-white">JOIN</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

interface GameSelectionScreenProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: (gameName: string, maxPlayers: number) => void;
}

export const GameSelectionScreen = ({ onJoinGame, onCreateGame }: GameSelectionScreenProps) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');

  const handleCreateGame = () => {
    if (newGameName.trim() === '') {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    const maxPlayersNum = parseInt(maxPlayers, 10);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 2 || maxPlayersNum > 8) {
      Alert.alert('Error', 'Players must be between 2 and 8');
      return;
    }

    onCreateGame(newGameName, maxPlayersNum);
    setCreateModalVisible(false);
    setNewGameName('');
    setMaxPlayers('4');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6 items-center">
          <Text className="text-3xl font-bold text-white">Unstable Engineers</Text>
          <Text className="mt-1 text-sm text-gray-400">Card Battle Game</Text>
        </View>

        {/* Create Game Button */}
        <TouchableOpacity
          className="mb-6 rounded-lg bg-indigo-700 p-3"
          onPress={() => setCreateModalVisible(true)}>
          <Text className="text-center text-lg font-bold text-white">CREATE NEW GAME</Text>
        </TouchableOpacity>

        {/* Available Games Section */}
        <View className="mb-4 flex-row items-center">
          <Text className="text-xl font-bold text-white">Available Games</Text>
          <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-purple-700">
            <Text className="text-xs font-bold text-white">{MOCK_GAMES.length}</Text>
          </View>
        </View>

        {/* Game List */}
        <FlatList
          data={MOCK_GAMES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GameItem
              id={item.id}
              name={item.name}
              host={item.host}
              players={item.players}
              maxPlayers={item.maxPlayers}
              onJoin={onJoinGame}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center p-10">
              <Text className="text-center text-gray-400">No games available. Create one!</Text>
            </View>
          }
        />
      </View>

      {/* Create Game Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/70">
          <View className="w-5/6 rounded-lg bg-gray-800 p-6">
            <Text className="mb-4 text-center text-xl font-bold text-white">Create New Game</Text>

            <Text className="mb-1 text-sm font-medium text-gray-300">Game Name</Text>
            <TextInput
              className="mb-4 rounded-lg bg-gray-700 p-3 text-white"
              placeholder="Enter game name..."
              placeholderTextColor="#9ca3af"
              value={newGameName}
              onChangeText={setNewGameName}
            />

            <Text className="mb-1 text-sm font-medium text-gray-300">Max Players (2-8)</Text>
            <TextInput
              className="mb-6 rounded-lg bg-gray-700 p-3 text-white"
              placeholder="4"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
            />

            <View className="flex-row justify-around">
              <TouchableOpacity
                className="rounded-lg bg-red-600 px-6 py-2"
                onPress={() => setCreateModalVisible(false)}>
                <Text className="font-bold text-white">CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg bg-green-600 px-6 py-2"
                onPress={handleCreateGame}>
                <Text className="font-bold text-white">CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
