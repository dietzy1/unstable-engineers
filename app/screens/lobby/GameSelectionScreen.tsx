import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from 'components/Header';
import { useState, useEffect } from 'react';
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
import { v4 as uuidv4 } from 'uuid';

import 'react-native-get-random-values';
import { GameListItem } from './GameListItem';
import { LobbyState, PlayerInfo } from '../../services/payload';
import { wsService } from '../../services/websocket';

// Storage keys
const USER_PROFILE_KEY = 'user_profile';
const USER_ID_KEY = 'user_id';

export const AVATARS = [
  { id: 'avatar1', source: require('../../assets/avatars/avatar1.png') },
  { id: 'avatar2', source: require('../../assets/avatars/avatar2.png') },
  { id: 'avatar3', source: require('../../assets/avatars/avatar3.png') },
  { id: 'avatar4', source: require('../../assets/avatars/avatar4.png') },
  { id: 'avatar5', source: require('../../assets/avatars/avatar5.png') },
];

interface GameSelectionScreenProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: (gameName: string, maxPlayers: number) => void;
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
  const [availableLobbies, setAvailableLobbies] = useState<LobbyState[]>([]);

  // User profile state
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar1');

  // Load user profile and connect to WebSocket
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Set up WebSocket message handlers
  useEffect(() => {
    const handleLobbyCreated = (payload: LobbyState) => {
      setAvailableLobbies((prev) => [...prev, payload]);
    };

    const handleLobbyState = (payload: LobbyState) => {
      setAvailableLobbies((prev) =>
        prev.map((lobby) => (lobby.lobbyId === payload.lobbyId ? payload : lobby))
      );
    };

    const handlePlayerJoined = (payload: { lobbyId: string; player: PlayerInfo }) => {
      setAvailableLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyId === payload.lobbyId
            ? {
                ...lobby,
                players: [...lobby.players, payload.player],
              }
            : lobby
        )
      );
    };

    const handlePlayerLeft = (payload: { lobbyId: string; userId: string }) => {
      setAvailableLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyId === payload.lobbyId
            ? {
                ...lobby,
                players: lobby.players.filter((p: PlayerInfo) => p.id !== payload.userId),
              }
            : lobby
        )
      );
    };

    const handleHostChanged = (payload: { lobbyId: string; newHostId: string }) => {
      setAvailableLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyId === payload.lobbyId
            ? {
                ...lobby,
                hostId: payload.newHostId,
                players: lobby.players.map((p: PlayerInfo) => ({
                  ...p,
                  isHost: p.id === payload.newHostId,
                })),
              }
            : lobby
        )
      );
    };

    const handleLobbyClosed = (payload: { lobbyId: string }) => {
      setAvailableLobbies((prev) => prev.filter((lobby) => lobby.lobbyId !== payload.lobbyId));
    };

    const handleError = (payload: { message: string }) => {
      Alert.alert('Error', payload.message);
    };

    wsService.on('lobby_created', handleLobbyCreated);
    wsService.on('lobby_state', handleLobbyState);
    wsService.on('player_joined', handlePlayerJoined);
    wsService.on('player_left', handlePlayerLeft);
    wsService.on('host_changed', handleHostChanged);
    wsService.on('lobby_closed', handleLobbyClosed);
    wsService.on('error', handleError);

    return () => {
      wsService.off('lobby_created', handleLobbyCreated);
      wsService.off('lobby_state', handleLobbyState);
      wsService.off('player_joined', handlePlayerJoined);
      wsService.off('player_left', handlePlayerLeft);
      wsService.off('host_changed', handleHostChanged);
      wsService.off('lobby_closed', handleLobbyClosed);
      wsService.off('error', handleError);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      let id = await AsyncStorage.getItem(USER_ID_KEY);
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem(USER_ID_KEY, id);
      }
      setUserId(id);

      const profileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        setUsername(profile.username || '');
        setSelectedAvatar(profile.avatar || 'avatar1');
      } else {
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

      // Reconnect WebSocket with new profile
      wsService.connect(userId, username, selectedAvatar);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  // Refresh available lobbies
  const onRefresh = () => {
    setRefreshing(true);
    // Request updated lobby list from server
    wsService.sendMessage('list_lobbies', {});
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCreateGame = () => {
    if (newGameName.trim() === '') {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    const maxPlayersNum = parseInt(maxPlayers, 10);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 2 || maxPlayersNum > 6) {
      Alert.alert('Error', 'Players must be between 2 and 6');
      return;
    }

    wsService.createLobby(newGameName, maxPlayersNum);
    onCreateGame(newGameName, maxPlayersNum);
    setCreateModalVisible(false);
    setNewGameName(newGameName);
    setMaxPlayers(maxPlayersNum.toString());
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
              <Text className="text-xs font-bold text-white">{availableLobbies.length}</Text>
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
            data={availableLobbies}
            keyExtractor={(item) => item.lobbyId}
            renderItem={({ item }) => <GameListItem lobby={item} onJoin={onJoinGame} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-400">No games available</Text>
                <Text className="mt-2 text-gray-500">Create a new game to get started!</Text>
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
              style={{
                width: 48,
                height: 48,
                borderRadius: 28,
              }}
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

              <Text className="mb-1 text-sm font-medium text-gray-300">Max Players (2-6)</Text>
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
                  className="rounded-lg bg-emerald-600 px-6 py-3"
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
        <View className="flex-1 items-center justify-center bg-black/80 ">
          <View className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800">
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
                    <Image
                      source={avatar.source}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                      }}
                    />
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
