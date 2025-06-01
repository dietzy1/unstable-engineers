package lobby

// CreateLobbyPayload represents the payload for creating a new lobby
type CreateLobbyPayload struct {
	GameName   string `json:"gameName"`
	MaxPlayers int    `json:"maxPlayers"`
}

// CreateLobbyResponse represents the response after creating a lobby
type CreateLobbyResponse struct {
	LobbyID    string `json:"lobbyId"`
	GameName   string `json:"gameName"`
	MaxPlayers int    `json:"maxPlayers"`
	IsHost     bool   `json:"isHost"`
}

// JoinLobbyPayload represents the payload for joining a lobby
type JoinLobbyPayload struct {
	LobbyID string `json:"lobbyId"`
}

// PlayerJoinedPayload represents the payload when a player joins a lobby
type PlayerJoinedPayload struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	AvatarID string `json:"avatarId"`
	IsHost   bool   `json:"isHost"`
	Ready    bool   `json:"ready"`
}

// PlayerLeftPayload represents the payload when a player leaves a lobby
type PlayerLeftPayload struct {
	UserID string `json:"userId"`
}

// HostChangedPayload represents the payload when the host changes
type HostChangedPayload struct {
	NewHostID string `json:"newHostId"`
}

// ReadyChangedPayload represents the payload when a player's ready status changes
type ReadyChangedPayload struct {
	UserID string `json:"userId"`
	Ready  bool   `json:"ready"`
}

// GameStartingPayload represents the payload when a game is starting
type GameStartingPayload struct {
	LobbyID string `json:"lobbyId"`
	GameID  string `json:"gameId"`
}

// ReorderPlayersPayload represents the payload for reordering players
type ReorderPlayersPayload struct {
	PlayerOrder []string `json:"playerOrder"`
}

// ErrorPayload represents an error message payload
type ErrorPayload struct {
	Message string `json:"message"`
}

// LobbyStatePayload represents the complete state of a lobby
type LobbyStatePayload struct {
	LobbyID    string       `json:"lobbyId"`
	GameName   string       `json:"gameName"`
	MaxPlayers int          `json:"maxPlayers"`
	HostID     string       `json:"hostId"`
	Players    []PlayerInfo `json:"players"`
}

// PlayerInfo represents information about a player in the lobby
type PlayerInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	AvatarID string `json:"avatarId"`
	Ready    bool   `json:"ready"`
	IsHost   bool   `json:"isHost"`
}
