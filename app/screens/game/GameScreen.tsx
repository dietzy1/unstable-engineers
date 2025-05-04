import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { GameOverviewScreen } from './GameOverviewScreen';
import { PlayerDetailScreen } from './PlayerDetailScreen';
import { CardProps, CardType } from '../../components/Card';
import { EffectProps } from '../../components/BuffDebuff';
import { CardAddedNotification } from '../../components/CardAddedNotification';
import { GameTable } from 'components/GameTable';

// Sample data for demonstration
const SAMPLE_MANA_CARDS: CardProps[] = [
  { id: 'm1', name: 'Mountain', type: 'mana', manaColor: 'red' },
  { id: 'm2', name: 'Island', type: 'mana', manaColor: 'blue' },
  { id: 'm3', name: 'Forest', type: 'mana', manaColor: 'green' },
  { id: 'm4', name: 'Swamp', type: 'mana', manaColor: 'black' },
  { id: 'm5', name: 'Plains', type: 'mana', manaColor: 'white' },
  { id: 'm6', name: 'Wastes', type: 'mana', manaColor: 'colorless' },
];

const SAMPLE_ACTION_CARDS: CardProps[] = [
  {
    id: 'a1',
    name: 'Fire Bolt',
    type: 'action',
    description: 'Deal 3 damage to any target',
    cost: 2,
  },
  {
    id: 'a2',
    name: 'Counterspell',
    type: 'action',
    description: 'Counter target spell',
    cost: 3,
  },
  {
    id: 'a3',
    name: 'Giant Growth',
    type: 'action',
    description: 'Target creature gets +3/+3 until end of turn',
    cost: 1,
  },
];

// Player type matching the CircularGameScreen component
export interface PlayerData {
  id: string;
  name: string;
  avatar: string;
  lifeTotal: number;
  effects: EffectProps[];
  cards: CardProps[];
  isCurrentPlayer: boolean;
}

// Sample player data
const SAMPLE_PLAYERS: PlayerData[] = [
  {
    id: 'player1',
    name: 'You',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [...SAMPLE_MANA_CARDS, ...SAMPLE_ACTION_CARDS],

    isCurrentPlayer: true,
  },
  {
    id: 'player2',
    name: 'Opponent 1',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p2m1', name: 'Island', type: 'mana' as CardType, manaColor: 'blue' },
      { id: 'p2m2', name: 'Island', type: 'mana' as CardType, manaColor: 'blue' },
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player3',
    name: 'Opponent 2',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p3m1', name: 'Mountain', type: 'mana' as CardType, manaColor: 'red' },
      { id: 'p3m2', name: 'Forest', type: 'mana' as CardType, manaColor: 'green' },
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player4',
    name: 'Opponent 3',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p4m1', name: 'Swamp', type: 'mana' as CardType, manaColor: 'black' },
      { id: 'p4m2', name: 'Plains', type: 'mana' as CardType, manaColor: 'white' },
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player5',
    name: 'Opponent 4',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p5m1', name: 'Mountain', type: 'mana' as CardType, manaColor: 'red' },
      { id: 'p5m2', name: 'Island', type: 'mana' as CardType, manaColor: 'blue' },
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
      { id: 'p6m1', name: 'Swamp', type: 'mana' as CardType, manaColor: 'black' },
      { id: 'p6m2', name: 'Plains', type: 'mana' as CardType, manaColor: 'white' },
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player7',
    name: 'Opponent 6',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p7m1', name: 'Forest', type: 'mana' as CardType, manaColor: 'green' },
      { id: 'p7m2', name: 'Mountain', type: 'mana' as CardType, manaColor: 'red' },
    ],
    isCurrentPlayer: false,
  },
  {
    id: 'player8',
    name: 'Opponent 7',
    avatar: 'avatar1.png',
    lifeTotal: 20,
    effects: [],
    cards: [
      { id: 'p8m1', name: 'Plains', type: 'mana' as CardType, manaColor: 'white' },
      { id: 'p8m2', name: 'Swamp', type: 'mana' as CardType, manaColor: 'black' },
    ],
    isCurrentPlayer: false,
  },
];

// Central game cards
const GAME_CARDS: CardProps[] = [
  {
    id: 'g1',
    name: 'Dragon',
    type: 'action',
    description: 'Flying',
    cost: 5,
    power: 5,
    toughness: 5,
  },
  {
    id: 'g2',
    name: 'Healing Salve',
    type: 'action',
    description: 'Gain 3 life or prevent 3 damage',
    cost: 1,
  },
];

interface NewGameScreenProps {
  gameId: string;
  onLeaveGame: () => void;
  userProfile?: { username: string; avatar: string } | null;
}

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

  const [gameCards, setGameCards] = useState<CardProps[]>(GAME_CARDS);
  const [currentView, setCurrentView] = useState<'main' | 'overview' | 'playerDetail'>('main');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    cardName: '',
    type: 'action' as CardType,
  });

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
  const handleDrawCard = (card: CardProps) => {
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
          onPlayerPress={handlePlayerPress}
          onCenterPress={handleCenterPress}
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
