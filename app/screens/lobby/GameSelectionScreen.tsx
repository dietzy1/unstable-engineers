import { Header } from 'components/Header';
import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

// Storage keys
const USER_PROFILE_KEY = 'user_profile';
const USER_ID_KEY = 'user_id';

// Mock data for available games
const MOCK_GAMES = [
  {
    id: 'game1',
    name: 'Dragon Battle',
    host: 'Player1',
    players: 1,
    maxPlayers: 4,
  },
  {
    id: 'game2',
    name: 'Magic Duel',
    host: 'Wizard99',
    players: 2,
    maxPlayers: 2,
  },
  {
    id: 'game3',
    name: 'Tournament Room',
    host: 'GrandMaster',
    players: 3,
    maxPlayers: 8,
  },
  {
    id: 'game4',
    name: 'Casual Game',
    host: 'Newbie',
    players: 1,
    maxPlayers: 4,
  },
  {
    id: 'game5',
    name: 'Pro Match',
    host: 'Champion',
    players: 1,
    maxPlayers: 2,
  },
];

// Mock avatars
const AVATARS = [
  { id: 'avatar1', source: require('../../assets/avatars/avatar1.png') },
  { id: 'avatar2', source: require('../../assets/avatars/avatar2.png') },
  { id: 'avatar3', source: require('../../assets/avatars/avatar3.png') },
  { id: 'avatar4', source: require('../../assets/avatars/avatar4.png') },
  { id: 'avatar5', source: require('../../assets/avatars/avatar5.png') },
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
  onProfileUpdate?: (profile: { username: string; avatar: string }) => void;
}

export const GameSelectionScreen = ({
  onJoinGame,
  onCreateGame,
  onProfileUpdate,
}: GameSelectionScreenProps) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [gameType, setGameType] = useState('Casual');
  const [filter, setFilter] = useState('All');

  // User profile state
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar1');

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load user profile from AsyncStorage
  const loadUserProfile = async () => {
    try {
      // Load or generate user ID
      let id = await AsyncStorage.getItem(USER_ID_KEY);
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem(USER_ID_KEY, id);
      }
      setUserId(id);

      // Load profile if exists
      const profileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        setUsername(profile.username || '');
        setSelectedAvatar(profile.avatar || 'avatar1');
      } else if (!username) {
        // Show profile modal if no profile exists
        setProfileModalVisible(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Save user profile to AsyncStorage
  const saveUserProfile = async () => {
    try {
      const profile = {
        username,
        avatar: selectedAvatar,
      };
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      // Notify parent component about profile update
      if (onProfileUpdate) {
        onProfileUpdate(profile);
      }
      setProfileModalVisible(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  // Simulated refresh function
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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
              <Text className="text-xs font-bold text-white">{MOCK_GAMES.length}</Text>
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

        {/* User Profile Section */}
        <TouchableOpacity
          className="mt-4 flex-row items-center justify-between rounded-xl border border-gray-700 bg-gray-800/50 p-4"
          onPress={() => setProfileModalVisible(true)}>
          {selectedAvatar ? (
            <Image
              source={AVATARS.find((a) => a.id === selectedAvatar)?.source}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-700">
              <Text className="text-lg text-white">?</Text>
            </View>
          )}

          <View className="flex-1 px-4">
            <Text className="text-lg font-bold text-white">{username || 'Set Your Username'}</Text>
            <Text className="text-xs text-gray-400">Tap to edit profile</Text>
          </View>

          <TouchableOpacity
            className="rounded-lg bg-indigo-600 px-3 py-2"
            onPress={() => setProfileModalVisible(true)}>
            <Text className="font-bold text-white">EDIT</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/80">
          <View className="w-5/6 overflow-hidden rounded-xl bg-gray-800">
            <Text className="pt-6 text-center text-xl font-bold text-white">Your Profile</Text>

            <View className="p-6">
              <Text className="mb-1 text-sm font-medium text-gray-300">Username</Text>
              <TextInput
                className="mb-4 rounded-lg bg-gray-700 p-3 text-white"
                placeholder="Enter username..."
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
              />

              <Text className="mb-2 text-sm font-medium text-gray-300">Select Avatar</Text>
              <View className="mb-4 flex-row flex-wrap justify-center">
                {AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.id}
                    className={`m-1 rounded-full border-2 p-1 ${
                      selectedAvatar === avatar.id ? 'border-indigo-500' : 'border-transparent'
                    }`}
                    onPress={() => setSelectedAvatar(avatar.id)}>
                    <Image source={avatar.source} className="h-14 w-14 rounded-full" />
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row justify-around">
                <TouchableOpacity
                  className="rounded-lg bg-gray-700 px-6 py-3"
                  onPress={() => setProfileModalVisible(false)}>
                  <Text className="font-bold text-white">CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-lg bg-emerald-600 px-6 py-3"
                  onPress={saveUserProfile}>
                  <Text className="font-bold text-white">SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
