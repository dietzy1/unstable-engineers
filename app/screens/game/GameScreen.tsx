import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { GameTable } from 'screens/game/overview/GameTable';

import { PlayerDetailScreen } from './detail/PlayerDetailScreen';
import { GameOverviewScreen } from './overview/GameOverviewScreen';
import { EffectProps } from '../../components/BuffDebuff';
import { CardAddedNotification } from '../../components/CardAddedNotification';
import { CardType, MagicCard } from '../../types/Card';

// Sample data for demonstration
const SAMPLE_MANA_CARDS: MagicCard[] = [
  {
    id: 'm1',
    name: 'Mountain',
    type: 'mana',
    manaColor: 'red',
    description: 'Mountain',
    cost: 0,
    image: '',
    onPress: () => {},
  },
  {
    id: 'm2',
    name: 'Island',
    type: 'mana',
    manaColor: 'blue',
    description: 'Island',
    cost: 0,
    image: '',
    onPress: () => {},
  },
  {
    id: 'm3',
    name: 'Forest',
    type: 'mana',
    manaColor: 'green',
    description: 'Forest',
    cost: 0,
    image: '',
    onPress: () => {},
  },
  {
    id: 'm4',
    name: 'Swamp',
    type: 'mana',
    manaColor: 'black',
    description: 'Swamp',
    cost: 0,
    image: '',
    onPress: () => {},
  },
];

const SAMPLE_ACTION_CARDS: MagicCard[] = [
  {
    id: '1',
    name: 'Fire Bolt',
    type: 'action',
    description: 'Deal 3 damage to any target',
    cost: 2,
    manaColor: 'red',
    image: '',
    onPress: () => {},
  },
  {
    id: 'a2',
    name: 'Counterspell',
    type: 'action',
    description: 'Counter target spell',
    cost: 3,
    manaColor: 'blue',
    image: '',
    onPress: () => {},
  },
  {
    id: 'a3',
    name: 'Giant Growth',
    type: 'action',
    description: 'Target creature gets +3/+3 until end of turn',
    cost: 1,
    manaColor: 'green',
    image: '',
    onPress: () => {},
  },
];

const SAMPLE_EFFECTS: EffectProps[] = [
  {
    id: 'e1',
    name: 'Strength',
    type: 'buff',
    description: 'Increases attack power by 2',
    duration: 3,
    value: 2,
  },
  {
    id: 'e2',
    name: 'Protection',
    type: 'buff',
    description: 'Prevents the next 3 damage',
    duration: 3,
    value: 3,
  },
  {
    id: 'e3',
    name: 'Regeneration',
    type: 'buff',
    description: 'Recover 1 health each turn',
    duration: 'permanent',
    value: 1,
  },
  {
    id: 'e4',
    name: 'Poison',
    type: 'debuff',
    description: 'Take 1 damage each turn',
    duration: 4,
    value: -1,
  },
  {
    id: 'e5',
    name: 'Weakness',
    type: 'debuff',
    description: 'Reduces attack power by 1',
    duration: 2,
    value: -1,
  },
  {
    id: 'e6',
    name: 'Stun',
    type: 'debuff',
    description: 'Skip your next turn',
    duration: 1,
  },
];

// Player type matching the CircularGameScreen component
export interface PlayerData {
  id: string;
  name: string;
  avatar: string;
  lifeTotal: number;
  effects: EffectProps[];
  cards: MagicCard[];
  isCurrentPlayer: boolean;
}

// Sample player data
const SAMPLE_PLAYERS: PlayerData[] = [
  {
    id: 'player1',
    name: 'You',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [...SAMPLE_MANA_CARDS, ...SAMPLE_ACTION_CARDS],
    isCurrentPlayer: true,
  },
  {
    id: 'player2',
    name: 'Opponent 1',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p2m1',
        name: 'Island',
        type: 'mana',
        manaColor: 'blue',
        description: 'Basic land - Island',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p2m2',
        name: 'Island',
        type: 'mana',
        manaColor: 'blue',
        description: 'Basic land - Island',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player3',
    name: 'Opponent 2',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p3m1',
        name: 'Mountain',
        type: 'mana',
        manaColor: 'red',
        description: 'Basic land - Mountain',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p3m2',
        name: 'Forest',
        type: 'mana',
        manaColor: 'green',
        description: 'Basic land - Forest',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player4',
    name: 'Opponent 3',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p4m1',
        name: 'Swamp',
        type: 'mana',
        manaColor: 'black',
        description: 'Basic land - Swamp',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p4m2',
        name: 'Plains',
        type: 'mana',
        manaColor: 'green',
        description: 'Basic land - Plains',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player5',
    name: 'Opponent 4',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p5m1',
        name: 'Mountain',
        type: 'mana',
        manaColor: 'red',
        description: 'Basic land - Mountain',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p5m2',
        name: 'Island',
        type: 'mana',
        manaColor: 'blue',
        description: 'Basic land - Island',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player6',
    name: 'Opponent 5',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      {
        id: 'p6m1',
        name: 'Swamp',
        type: 'mana',
        manaColor: 'black',
        description: 'Basic land - Swamp',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p6m2',
        name: 'Plains',
        type: 'mana',
        manaColor: 'green',
        description: 'Basic land - Plains',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player7',
    name: 'Opponent 6',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p7m1',
        name: 'Forest',
        type: 'mana',
        manaColor: 'green',
        description: 'Basic land - Forest',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p7m2',
        name: 'Mountain',
        type: 'mana',
        manaColor: 'red',
        description: 'Basic land - Mountain',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player8',
    name: 'Opponent 7',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [...SAMPLE_EFFECTS],
    cards: [
      {
        id: 'p8m1',
        name: 'Plains',
        type: 'mana',
        manaColor: 'green',
        description: 'Basic land - Plains',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      {
        id: 'p8m2',
        name: 'Swamp',
        type: 'mana',
        manaColor: 'black',
        description: 'Basic land - Swamp',
        cost: 0,
        image: '',
        onPress: () => {},
      },
      ...SAMPLE_ACTION_CARDS,
    ],
    isCurrentPlayer: false,
  },
];

// Central game cards
const GAME_CARDS: MagicCard[] = [
  {
    id: 'g1',
    name: 'Dragon',
    type: 'action',
    description: 'Flying',
    cost: 5,
    manaColor: 'red',
    image: '',
    onPress: () => {},
  },
  {
    id: 'g2',
    name: 'Healing Salve',
    type: 'action',
    description: 'Gain 3 life or prevent 3 damage',
    cost: 1,
    manaColor: 'black',
    image: '',
    onPress: () => {},
  },
];

interface NewGameScreenProps {
  gameId: string;
  onLeaveGame: () => void;
  userProfile?: { username: string; avatar: string } | null;
}

// Maximum turn time in seconds
const MAX_TURN_TIME = 60;

export const GameScreen = ({ gameId, onLeaveGame, userProfile }: NewGameScreenProps) => {
  // Game state
  const [players, setPlayers] = useState<PlayerData[]>(() => {
    // Update player name if userProfile is available
    if (userProfile?.username) {
      return SAMPLE_PLAYERS.map((player) => {
        if (player.id === 'player1') {
          return {
            ...player,
            name: userProfile.username,
          };
        }
        return player;
      });
    }
    return SAMPLE_PLAYERS;
  });

  const [gameCards, setGameCards] = useState<MagicCard[]>(GAME_CARDS);
  const [currentView, setCurrentView] = useState<'main' | 'overview' | 'playerDetail'>('main');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Turn management state
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string>('player1');
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(MAX_TURN_TIME);
  const [turnTimerActive, setTurnTimerActive] = useState<boolean>(true);

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    cardName: '',
    type: 'action' as CardType,
  });

  // Turn timer effect
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (turnTimerActive && turnTimeRemaining > 0) {
      timerInterval = setInterval(() => {
        setTurnTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up, end turn
            clearInterval(timerInterval);
            handleEndTurn();
            return MAX_TURN_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [turnTimerActive, turnTimeRemaining, currentTurnPlayerId]);

  // Handle end of turn
  const handleEndTurn = () => {
    // Find the index of the current player
    const currentPlayerIndex = players.findIndex((player) => player.id === currentTurnPlayerId);

    // Calculate the next player index (circular)
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;

    // Update current turn player
    setCurrentTurnPlayerId(nextPlayerId);

    // Reset turn timer
    setTurnTimeRemaining(MAX_TURN_TIME);

    // Update player isCurrentPlayer property
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => ({
        ...player,
        isCurrentPlayer: player.id === nextPlayerId,
      }));
    });
  };

  // Handle player selection
  const handlePlayerPress = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setCurrentView('playerDetail');
  };

  // Handle center table press
  const handleCenterPress = () => {
    setCurrentView('overview');
  };

  // Return to main view
  const handleReturnToMain = () => {
    setCurrentView('main');
    setSelectedPlayerId(null);
  };

  // Handler for drawing a card
  const handleDrawCard = (card: MagicCard) => {
    // Add card to current player's hand
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => {
        if (player.isCurrentPlayer) {
          return {
            ...player,
            cards: [
              ...player.cards,
              { ...card, id: `card-${Date.now()}-${Math.random().toString(36)}` },
            ],
          };
        }
        return player;
      });
    });

    // Show notification
    setNotification({
      visible: true,
      cardName: card.name,
      type: card.type,
    });

    // Return to main screen after drawing
    setCurrentView('main');
  };

  // Apply effect to a player
  const handleApplyEffect = (effect: EffectProps, targetPlayerId: string) => {
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => {
        if (player.id === targetPlayerId) {
          return {
            ...player,
            effects: [...player.effects, effect],
          };
        }
        return player;
      });
    });

    // Return to main screen after applying effect
    setCurrentView('main');
  };

  // Hide notification
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  // Check if it's the current user's turn
  const isCurrentUserTurn = currentTurnPlayerId === 'player1';

  // Selected player data
  const selectedPlayer = selectedPlayerId
    ? players.find((player) => player.id === selectedPlayerId)
    : null;

  // Render the appropriate view based on currentView state
  return (
    <>
      {currentView === 'main' && (
        <GameTable
          playerData={players}
          currentPlayerId="player1" // Always current player ID
          currentTurnPlayerId={currentTurnPlayerId}
          turnTimeRemaining={turnTimeRemaining}
          onPlayerPress={handlePlayerPress}
          onCenterPress={handleCenterPress}
          onEndTurn={isCurrentUserTurn ? handleEndTurn : undefined}
          onLeaveGame={onLeaveGame}
          gameCards={gameCards}
        />
      )}

      {/* Game Overview Modal */}
      {currentView === 'overview' && (
        <Modal animationType="slide">
          <GameOverviewScreen
            onNavigateToHand={handleReturnToMain}
            onDrawManaCard={handleDrawCard}
            onDrawActionCard={handleDrawCard}
            playerIds={players.map((p) => p.id)}
            playerNames={players.map((p) => p.name)}
            onApplyEffect={handleApplyEffect}
          />
        </Modal>
      )}

      {/* Player Detail Modal */}
      {currentView === 'playerDetail' && selectedPlayer && (
        <Modal animationType="slide">
          <PlayerDetailScreen
            playerName={selectedPlayer.name}
            manaCards={selectedPlayer.cards.filter((card) => card.type === 'mana')}
            buffEffects={selectedPlayer.effects.filter((effect) => effect.type === 'buff')}
            debuffEffects={selectedPlayer.effects.filter((effect) => effect.type === 'debuff')}
            onClose={handleReturnToMain}
            onEffectPress={() => {}}
          />
        </Modal>
      )}

      {/* Card Added Notification */}
      {notification.visible && (
        <CardAddedNotification
          visible={notification.visible}
          cardName={notification.cardName}
          type={notification.type}
          onHide={hideNotification}
        />
      )}
    </>
  );
};
