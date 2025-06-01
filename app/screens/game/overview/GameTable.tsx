import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PlayerData } from 'screens/game/GameScreen';
import { MagicCard } from 'types/Card';

import { CardHand } from './CardHand';
import { useDrag } from './DragContext';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import { PlayerInformation } from './PlayerInformation';
import { PlayerStatsBar } from './PlayerStatsBar';
import { Header } from '../../../components/Header';

interface GameTableProps {
  playerData: PlayerData[];
  currentPlayerId: string;
  currentTurnPlayerId: string;
  turnTimeRemaining: number;
  onPlayerPress: (playerId: string) => void;
  onCenterPress: () => void;
  onEndTurn?: () => void;
  onLeaveGame: () => void;
  gameCards: MagicCard[];
}

export const GameTable = ({
  playerData,
  currentPlayerId,
  currentTurnPlayerId,
  turnTimeRemaining,
  onPlayerPress,
  onCenterPress,
  onEndTurn,
  onLeaveGame,
  gameCards = [],
}: GameTableProps) => {
  const [playerDataState, setPlayerDataState] = useState<PlayerData[]>(playerData);
  const [gameCardsState, setGameCardsState] = useState<MagicCard[]>(gameCards);
  const {
    draggingCardId,
    dragPosition,
    setDraggingCardId,
    setDragPosition,
    setCenterLayout,
    centerLayout,
  } = useDrag();
  const [highlight, setHighlight] = useState(false);
  const highlightAnim = useSharedValue(0);

  // Highlight animation style
  const highlightStyle = useAnimatedStyle(() => ({
    shadowColor: '#facc15',
    shadowOpacity: highlightAnim.value,
    shadowRadius: 30 * highlightAnim.value,
    shadowOffset: { width: 0, height: 0 },
    borderColor: highlightAnim.value > 0 ? '#facc15' : '#475569',
    borderWidth: 4,
  }));

  // Effect: when highlight is set, animate
  React.useEffect(() => {
    console.log('Highlight changed:', highlight);
    if (highlight) {
      highlightAnim.value = withTiming(1, { duration: 200 }, () => {
        highlightAnim.value = withTiming(0, { duration: 600 });
      });
      setTimeout(() => setHighlight(false), 800);
    }
  }, [highlight]);

  // Effect: highlight board when dragging card over it
  React.useEffect(() => {
    if (draggingCardId && dragPosition && centerLayout) {
      console.log('Drag position:', dragPosition);
      console.log('Center layout:', centerLayout);
      const { x, y, width, height } = centerLayout;
      const isOverBoard =
        dragPosition.x >= x &&
        dragPosition.x <= x + width &&
        dragPosition.y >= y &&
        dragPosition.y <= y + height;

      console.log('Is over board:', isOverBoard);
      if (isOverBoard) {
        setHighlight(true);
      }
    }
  }, [draggingCardId, dragPosition, centerLayout]);

  // Effect: Update board position when layout changes
  useEffect(() => {
    const updateBoardPosition = () => {
      if (centerLayout) {
        console.log('Updating board position');
        setCenterLayout(centerLayout);
      }
    };

    // Update position after a short delay to ensure layout is complete
    const timeoutId = setTimeout(updateBoardPosition, 100);
    return () => clearTimeout(timeoutId);
  }, [centerLayout, setCenterLayout]);

  const handlePlayCard = (cardId: string) => {
    console.log('Playing card:', cardId);
    const currentPlayer = playerDataState.find((p) => p.id === currentPlayerId);
    if (!currentPlayer) {
      console.log('Current player not found');
      return;
    }

    const cardToPlay = currentPlayer.cards.find((c) => c.id === cardId);
    if (!cardToPlay) {
      console.log('Card to play not found');
      return;
    }

    // Update player's hand
    const updatedPlayers = playerDataState.map((p) => {
      if (p.id === currentPlayerId) {
        return {
          ...p,
          cards: p.cards.filter((c) => c.id !== cardId),
        };
      }
      return p;
    });

    setPlayerDataState(updatedPlayers);
    setGameCardsState((prev) => [...prev, cardToPlay]);
    console.log('Card played successfully');
  };

  // Split players
  const opponents = playerData.filter((p) => p.id !== currentPlayerId);
  const rightOpponents = opponents.slice(0, 4);
  const leftOpponents = opponents.slice(4);

  // Find the current player
  const currentPlayer = playerData.find((p) => p.id === currentPlayerId);

  // Is it the current user's turn?
  const isCurrentUserTurn = currentTurnPlayerId === currentPlayerId;
  const currentTurnPlayerName = playerData.find((p) => p.id === currentTurnPlayerId)?.name || '';

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Header />

      <GameControls
        isCurrentUserTurn={isCurrentUserTurn}
        currentTurnPlayerName={currentTurnPlayerName}
        turnTimeRemaining={turnTimeRemaining}
        onLeaveGame={onLeaveGame}
        onEndTurn={onEndTurn}
      />

      <View className="mt-40 flex-1 flex-col">
        {leftOpponents.length > 0 && (
          <View className="absolute left-0 justify-center">
            {leftOpponents.map((player) => (
              <View key={player.id} className="my-2">
                <PlayerInformation
                  player={player}
                  isCurrentPlayer={false}
                  isPlayerTurn={player.id === currentTurnPlayerId}
                  onPress={onPlayerPress}
                />
              </View>
            ))}
          </View>
        )}

        <View className="flex-1 items-center">
          <GameBoard
            highlight={highlight}
            setCenterLayout={setCenterLayout}
            gameCards={gameCardsState}
            highlightStyle={highlightStyle}
          />
        </View>

        <View className="absolute right-0 justify-center">
          {rightOpponents.map((player) => (
            <View key={player.id} className="my-2">
              <PlayerInformation
                player={player}
                isCurrentPlayer={false}
                isPlayerTurn={player.id === currentTurnPlayerId}
                onPress={onPlayerPress}
              />
            </View>
          ))}
        </View>
      </View>

      {currentPlayer && (
        <>
          <CardHand cards={currentPlayer.cards} onPlayCard={handlePlayCard} />
          <PlayerStatsBar player={currentPlayer} />
        </>
      )}
    </SafeAreaView>
  );
};
