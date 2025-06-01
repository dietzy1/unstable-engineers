import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface GameControlsProps {
  isCurrentUserTurn: boolean;
  currentTurnPlayerName: string;
  turnTimeRemaining: number;
  onLeaveGame: () => void;
  onEndTurn?: () => void;
}

const formatTimeRemaining = (turnTimeRemaining: number) => {
  const minutes = Math.floor(turnTimeRemaining / 60);
  const seconds = turnTimeRemaining % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const GameControls = ({
  isCurrentUserTurn,
  currentTurnPlayerName,
  turnTimeRemaining,
  onLeaveGame,
  onEndTurn,
}: GameControlsProps) => {
  return (
    <View className="mb-0 px-3">
      {/* Turn indicator and timer */}
      <View className="mb-2 items-center">
        <Text className="text-lg font-bold text-white">
          {isCurrentUserTurn ? 'Your Turn' : `${currentTurnPlayerName}'s Turn`}
        </Text>
        <View className="mt-1 flex-row items-center">
          <View className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
          <Text className="text-md font-semibold text-amber-300">
            {formatTimeRemaining(turnTimeRemaining)}
          </Text>
        </View>
      </View>

      {/* Game controls */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity className="rounded-lg bg-red-600 px-3 py-2" onPress={onLeaveGame}>
          <Text className="font-bold text-white">Leave Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-lg px-3 py-2 ${isCurrentUserTurn ? 'bg-indigo-600' : 'bg-gray-600'}`}
          onPress={isCurrentUserTurn ? onEndTurn : undefined}
          disabled={!isCurrentUserTurn || !onEndTurn}>
          <Text className={`font-bold ${isCurrentUserTurn ? 'text-white' : 'text-gray-400'}`}>
            End Turn
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameControls;
