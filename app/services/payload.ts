// Message types
export type MessageType =
  | 'create_lobby'
  | 'join_lobby'
  | 'leave_lobby'
  | 'toggle_ready'
  | 'start_game'
  | 'reorder_players'
  | 'lobby_created'
  | 'player_joined'
  | 'player_left'
  | 'player_ready_changed'
  | 'game_starting'
  | 'players_reordered'
  | 'host_changed'
  | 'lobby_state'
  | 'lobby_closed'
  | 'list_lobbies'
  | 'error';

// Payload types matching Go backend
export interface CreateLobbyPayload {
  gameName: string;
  maxPlayers: number;
}

export interface CreateLobbyResponse {
  lobbyId: string;
  gameName: string;
  maxPlayers: number;
  isHost: boolean;
}

export interface JoinLobbyPayload {
  lobbyId: string;
}

export interface PlayerJoinedPayload {
  userId: string;
  username: string;
  avatarId: string;
  isHost: boolean;
  ready: boolean;
}

export interface PlayerLeftPayload {
  userId: string;
}

export interface HostChangedPayload {
  newHostId: string;
}

export interface ReadyChangedPayload {
  userId: string;
  ready: boolean;
}

export interface GameStartingPayload {
  lobbyId: string;
  gameId: string;
}

export interface ReorderPlayersPayload {
  playerOrder: string[];
}

export interface ErrorPayload {
  message: string;
}

export interface PlayerInfo {
  id: string;
  username: string;
  avatarId: string;
  ready: boolean;
  isHost: boolean;
}

export interface LobbyState {
  lobbyId: string;
  gameName: string;
  maxPlayers: number;
  hostId: string;
  players: PlayerInfo[];
}
