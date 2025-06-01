import { View, Text, TouchableOpacity } from 'react-native';
import { LobbyState, PlayerInfo } from 'services/payload';

interface GameListItemProps {
  lobby: LobbyState;
  onJoin: (gameId: string) => void;
}

// Component for individual game items in the list
export const GameListItem = ({ lobby, onJoin }: GameListItemProps) => {
  const isGameFull = lobby.players.length >= lobby.maxPlayers;
  const host = lobby.players.find((p: PlayerInfo) => p.id === lobby.hostId);

  return (
    <TouchableOpacity
      className="my-2 rounded-xl border border-gray-700 p-4"
      onPress={() => onJoin(lobby.lobbyId)}
      activeOpacity={0.8}
      disabled={isGameFull}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-12 w-2 rounded-full ${isGameFull ? 'bg-red-500' : 'bg-green-500'}`}
          />
          <View>
            <Text className="text-lg font-bold text-white">{lobby.gameName}</Text>
            <View className="mt-1 flex-row items-center">
              <Text className="text-sm text-gray-300">Hosted by: </Text>
              <Text className="text-sm font-medium text-amber-400">
                {host?.username || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center">
            <Text className="mr-1 text-sm text-white">
              {lobby.players.length}/{lobby.maxPlayers}
            </Text>
            <View className="flex-row">
              {Array(lobby.maxPlayers)
                .fill(0)
                .map((_, idx) => (
                  <View
                    key={idx}
                    className={`mx-0.5 h-3 w-3 rounded-full ${
                      idx < lobby.players.length ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
            </View>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row justify-end">
        <TouchableOpacity
          className={`rounded-lg px-5 py-2 ${isGameFull ? 'bg-gray-600' : 'bg-indigo-600'}`}
          onPress={() => !isGameFull && onJoin(lobby.lobbyId)}
          disabled={isGameFull}>
          <Text className="font-bold text-white">{isGameFull ? 'FULL' : 'JOIN'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
