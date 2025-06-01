package lobby

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID       string
	avatarID string
	Username string
	Ready    bool
}

// Type that restricts the number of players within values between 2 and 6
type MaxPlayers int

type Lobby struct {
	ID         string
	HostID     string
	GameName   string
	GameID     string
	MaxPlayers MaxPlayers
	CreatedAt  time.Time
	Players    map[string]*User
}

type LobbyManager struct {
	mu      sync.RWMutex
	lobbies map[string]*Lobby
}

// NewLobbyManager creates a new lobby manager
func NewLobbyManager() *LobbyManager {
	return &LobbyManager{
		lobbies: make(map[string]*Lobby),
	}
}

// CreateLobby creates a new lobby
func (m *LobbyManager) CreateLobby(hostID string, gameName string, maxPlayers MaxPlayers) *Lobby {
	m.mu.Lock()
	defer m.mu.Unlock()

	lobbyID := uuid.New().String()
	gameID := uuid.New().String()

	lobby := &Lobby{
		ID:         lobbyID,
		HostID:     hostID,
		GameName:   gameName,
		GameID:     gameID,
		MaxPlayers: maxPlayers,
		CreatedAt:  time.Now(),
		Players:    make(map[string]*User),
	}

	m.lobbies[lobbyID] = lobby
	return lobby
}

// GetLobby retrieves a lobby by ID
func (m *LobbyManager) GetLobby(id string) *Lobby {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.lobbies[id]
}

// CloseLobby removes a lobby
func (m *LobbyManager) CloseLobby(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.lobbies, id)
}

// ListLobbies returns a list of all available lobbies
func (m *LobbyManager) ListLobbies() []*Lobby {
	m.mu.RLock()
	defer m.mu.RUnlock()

	lobbies := make([]*Lobby, 0, len(m.lobbies))
	for _, lobby := range m.lobbies {
		lobbies = append(lobbies, lobby)
	}
	return lobbies
}

// JoinLobby adds a player to a lobby
func (m *LobbyManager) JoinLobby(lobbyID string, user *User) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	lobby, exists := m.lobbies[lobbyID]
	if !exists {
		return ErrLobbyNotFound
	}

	if len(lobby.Players) >= int(lobby.MaxPlayers) {
		return ErrLobbyFull
	}

	lobby.Players[user.ID] = user
	return nil
}

// LeaveLobby removes a player from a lobby
func (m *LobbyManager) LeaveLobby(lobbyID string, userID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	lobby, exists := m.lobbies[lobbyID]
	if !exists {
		return ErrLobbyNotFound
	}

	delete(lobby.Players, userID)

	// If lobby is empty, remove it
	if len(lobby.Players) == 0 {
		delete(m.lobbies, lobbyID)
		return nil
	}

	// If host left, assign new host
	if lobby.HostID == userID {
		// Assign first player as new host
		for id := range lobby.Players {
			lobby.HostID = id
			break
		}
	}

	return nil
}

// SetPlayerReady updates a player's ready status
func (m *LobbyManager) SetPlayerReady(lobbyID string, userID string, ready bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	lobby, exists := m.lobbies[lobbyID]
	if !exists {
		return ErrLobbyNotFound
	}

	player, exists := lobby.Players[userID]
	if !exists {
		return ErrPlayerNotFound
	}

	player.Ready = ready
	return nil
}

// AreAllPlayersReady checks if all players in a lobby are ready
func (m *LobbyManager) AreAllPlayersReady(lobbyID string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	lobby, exists := m.lobbies[lobbyID]
	if !exists {
		return false, ErrLobbyNotFound
	}

	if len(lobby.Players) == 0 {
		return false, nil
	}

	for _, player := range lobby.Players {
		if !player.Ready {
			return false, nil
		}
	}

	return true, nil
}

// Custom errors
var (
	ErrLobbyNotFound  = &LobbyError{"lobby not found"}
	ErrLobbyFull      = &LobbyError{"lobby is full"}
	ErrPlayerNotFound = &LobbyError{"player not found"}
)

type LobbyError struct {
	message string
}

func (e *LobbyError) Error() string {
	return e.message
}
