import { Header } from 'components/Header';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';

// Mock data for available games
const MOCK_GAMES = [
  {
    id: 'game1',
    name: 'Dragon Battle',
    host: 'Player1',
    players: 1,
    maxPlayers: 4,
    gameType: 'Casual',
  },
  {
    id: 'game2',
    name: 'Magic Duel',
    host: 'Wizard99',
    players: 2,
    maxPlayers: 2,
    gameType: 'Ranked',
  },
  {
    id: 'game3',
    name: 'Tournament Room',
    host: 'GrandMaster',
    players: 3,
    maxPlayers: 8,
    gameType: 'Tournament',
  },
  {
    id: 'game4',
    name: 'Casual Game',
    host: 'Newbie',
    players: 1,
    maxPlayers: 4,
    gameType: 'Casual',
  },
  {
    id: 'game5',
    name: 'Pro Match',
    host: 'Champion',
    players: 1,
    maxPlayers: 2,
    gameType: 'Ranked',
  },
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
  const isGameFull = players >= maxPlayers;

  return (
    <TouchableOpacity
      className="my-2 rounded-xl border border-gray-700 p-4"
      onPress={() => onJoin(id)}
      activeOpacity={0.8}
      disabled={isGameFull}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-12 w-2 rounded-full ${isGameFull ? 'bg-red-500' : 'bg-green-500'}`}
          />
          <View>
            <Text className="text-lg font-bold text-white">{name}</Text>
            <View className="mt-1 flex-row items-center">
              <Text className="text-sm text-gray-300">Hosted by: </Text>
              <Text className="text-sm font-medium text-amber-400">{host}</Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center">
            <Text className="mr-1 text-sm text-white">
              {players}/{maxPlayers}
            </Text>
            <View className="flex-row">
              {Array(maxPlayers)
                .fill(0)
                .map((_, idx) => (
                  <View
                    key={idx}
                    className={`mx-0.5 h-3 w-3 rounded-full ${idx < players ? 'bg-blue-500' : 'bg-gray-600'}`}
                  />
                ))}
            </View>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row justify-end">
        <TouchableOpacity
          className={`rounded-lg px-5 py-2 ${isGameFull ? 'bg-gray-600' : 'bg-indigo-600'}`}
          onPress={() => !isGameFull && onJoin(id)}
          disabled={isGameFull}>
          <Text className="font-bold text-white">{isGameFull ? 'FULL' : 'JOIN'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

interface GameSelectionScreenProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: (gameName: string, maxPlayers: number, gameType: string) => void;
}

export const GameSelectionScreen = ({ onJoinGame, onCreateGame }: GameSelectionScreenProps) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [gameType, setGameType] = useState('Casual');
  const [filter, setFilter] = useState('All');

  // Simulated refresh function
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const filteredGames =
    filter === 'All' ? MOCK_GAMES : MOCK_GAMES.filter((game) => game.gameType === filter);

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

    onCreateGame(newGameName, maxPlayersNum, gameType);
    setCreateModalVisible(false);
    setNewGameName('');
    setMaxPlayers('4');
    setGameType('Casual');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-4">
        <Header />

        {/* Create Game Button */}
        <TouchableOpacity
          className="mb-6 rounded-lg bg-indigo-700 p-3"
          onPress={() => setCreateModalVisible(true)}>
          <Text className="text-center text-lg font-bold text-white">CREATE NEW GAME</Text>
        </TouchableOpacity>

        {/* Available Games Section */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-white">Available Games</Text>
            <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-indigo-700">
              <Text className="text-xs font-bold text-white">{filteredGames.length}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onRefresh}>
            <Text className="text-indigo-400">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Game List */}
        {refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
            data={filteredGames}
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
              <View className="items-center justify-center rounded-xl bg-gray-800/50 p-10">
                <Text className="text-center text-gray-400">
                  No games available for this filter.
                </Text>
                <TouchableOpacity
                  className="mt-4 rounded-lg bg-indigo-700 px-4 py-2"
                  onPress={() => setFilter('All')}>
                  <Text className="font-medium text-white">Show All Games</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Create Game Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/80">
          <View className="w-5/6 overflow-hidden rounded-xl bg-gray-800">
            <Text className="pt-6 text-center text-xl font-bold text-white">Create New Game</Text>

            <View className="p-6">
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
                className="mb-4 rounded-lg bg-gray-700 p-3 text-white"
                placeholder="4"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={maxPlayers}
                onChangeText={setMaxPlayers}
              />

              <View className="flex-row justify-around">
                <TouchableOpacity
                  className="rounded-lg bg-gray-700 px-6 py-3"
                  onPress={() => setCreateModalVisible(false)}>
                  <Text className="font-bold text-white">CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-lg bg-emerald-600   px-6 py-3"
                  onPress={handleCreateGame}>
                  <Text className="font-bold text-white">CREATE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
