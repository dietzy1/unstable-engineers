package lobby

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Message represents a WebSocket message
type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// Client represents a connected WebSocket client
type Client struct {
	ID       string
	UserID   string
	Username string
	AvatarID string
	Conn     *websocket.Conn
	LobbyID  string
	Ready    bool
	Manager  *LobbyManager
}

// WebSocketServer handles WebSocket connections and message routing
type WebSocketServer struct {
	upgrader websocket.Upgrader
	manager  *LobbyManager
	clients  map[string]*Client
	mu       sync.RWMutex
}

// NewWebSocketServer creates a new WebSocket server
func NewWebSocketServer(manager *LobbyManager) *WebSocketServer {
	return &WebSocketServer{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
		manager: manager,
		clients: make(map[string]*Client),
	}
}

// HandleWebSocket upgrades HTTP connection to WebSocket and handles client connection
func (s *WebSocketServer) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	userID := r.URL.Query().Get("userId")
	username := r.URL.Query().Get("username")
	avatarID := r.URL.Query().Get("avatarId")
	lobbyID := r.URL.Query().Get("lobbyId")

	if userID == "" || username == "" {
		http.Error(w, "Missing required parameters", http.StatusBadRequest)
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create new client
	client := &Client{
		ID:       userID,
		UserID:   userID,
		Username: username,
		AvatarID: avatarID,
		Conn:     conn,
		LobbyID:  lobbyID,
		Ready:    false,
		Manager:  s.manager,
	}

	// Register client
	s.mu.Lock()
	s.clients[userID] = client
	s.mu.Unlock()

	// Start handling messages
	go s.handleClient(client)
}

// handleClient handles messages from a client
func (s *WebSocketServer) handleClient(client *Client) {
	defer func() {
		s.mu.Lock()
		delete(s.clients, client.ID)
		s.mu.Unlock()
		client.Conn.Close()

		// Notify lobby about client disconnection
		if client.LobbyID != "" {
			s.broadcastToLobby(client.LobbyID, Message{
				Type:    "player_left",
				Payload: json.RawMessage(`{"userId": "` + client.ID + `"}`),
			})
		}
	}()

	for {
		var msg Message
		err := client.Conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		switch msg.Type {
		case "create_lobby":
			s.handleCreateLobby(client, msg.Payload)
		case "join_lobby":
			s.handleJoinLobby(client, msg.Payload)
		case "leave_lobby":
			s.handleLeaveLobby(client)
		case "toggle_ready":
			s.handleToggleReady(client)
		case "start_game":
			s.handleStartGame(client)
		case "reorder_players":
			s.handleReorderPlayers(client, msg.Payload)
		}
	}
}

// handleCreateLobby handles lobby creation request
func (s *WebSocketServer) handleCreateLobby(client *Client, payload json.RawMessage) {
	var data CreateLobbyPayload

	if err := json.Unmarshal(payload, &data); err != nil {
		s.sendError(client, "Invalid create lobby request")
		return
	}

	lobby := s.manager.CreateLobby(client.UserID, data.GameName, MaxPlayers(data.MaxPlayers))
	client.LobbyID = lobby.ID

	// Add player to lobby
	lobby.Players[client.UserID] = &User{
		ID:       client.UserID,
		Username: client.Username,
		avatarID: client.AvatarID,
		Ready:    true,
	}

	// Create response payload
	response := CreateLobbyResponse{
		LobbyID:    lobby.ID,
		GameName:   lobby.GameName,
		MaxPlayers: int(lobby.MaxPlayers),
		IsHost:     true,
	}

	// Marshal the response
	payloadBytes, err := json.Marshal(response)
	if err != nil {
		s.sendError(client, "Error creating lobby")
		return
	}

	// Notify client about lobby creation
	s.sendToClient(client, Message{
		Type:    "lobby_created",
		Payload: payloadBytes,
	})

	// Broadcast to all clients that a new lobby was created
	s.broadcastToAll(Message{
		Type:    "lobby_state",
		Payload: json.RawMessage(s.getLobbyStateJSON(lobby)),
	})
}

// getLobbyStateJSON returns a JSON string of the lobby state
func (s *WebSocketServer) getLobbyStateJSON(lobby *Lobby) string {
	state := LobbyStatePayload{
		LobbyID:    lobby.ID,
		GameName:   lobby.GameName,
		MaxPlayers: int(lobby.MaxPlayers),
		HostID:     lobby.HostID,
		Players:    make([]PlayerInfo, 0, len(lobby.Players)),
	}

	for id, player := range lobby.Players {
		state.Players = append(state.Players, PlayerInfo{
			ID:       id,
			Username: player.Username,
			AvatarID: player.avatarID,
			Ready:    player.Ready,
			IsHost:   id == lobby.HostID,
		})
	}

	json, err := json.Marshal(state)
	if err != nil {
		log.Printf("Error marshaling lobby state: %v", err)
		return "{}"
	}
	return string(json)
}

// broadcastToAll sends a message to all connected clients
func (s *WebSocketServer) broadcastToAll(msg Message) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, client := range s.clients {
		s.sendToClient(client, msg)
	}
}

// handleJoinLobby handles lobby join request
func (s *WebSocketServer) handleJoinLobby(client *Client, payload json.RawMessage) {
	var data JoinLobbyPayload

	if err := json.Unmarshal(payload, &data); err != nil {
		log.Printf("Invalid join lobby request: %v", err)
		s.sendError(client, "Invalid join lobby request")
		return
	}

	lobby := s.manager.GetLobby(data.LobbyID)
	if lobby == nil {
		log.Printf("Lobby not found: %s", data.LobbyID)
		s.sendError(client, "Lobby not found")
		return
	}

	if len(lobby.Players) >= int(lobby.MaxPlayers) {
		log.Printf("Lobby is full: %s", data.LobbyID)
		s.sendError(client, "Lobby is full")
		return
	}

	client.LobbyID = lobby.ID

	// Check if player already exists in lobby (reconnection case)
	existingPlayer := lobby.Players[client.UserID]
	var playerReady bool
	var isNewPlayer bool

	if existingPlayer != nil {
		// Player is rejoining - preserve their ready status
		playerReady = existingPlayer.Ready
		isNewPlayer = false
		log.Printf("Player %s is rejoining lobby %s with ready status: %v", client.UserID, lobby.ID, playerReady)
	} else {
		// New player joining
		playerReady = false
		isNewPlayer = true
		log.Printf("New player %s joining lobby %s", client.UserID, lobby.ID)
	}

	// Add/update player in lobby
	lobby.Players[client.UserID] = &User{
		ID:       client.UserID,
		Username: client.Username,
		avatarID: client.AvatarID,
		Ready:    playerReady,
	}

	client.Ready = playerReady

	log.Printf("Player %s joined lobby %s", client.UserID, lobby.ID)
	log.Printf("Current lobby state: %s", s.getLobbyStateJSON(lobby))

	// Only broadcast player_joined for new players, not reconnections
	if isNewPlayer {
		// Create player joined payload
		playerJoined := PlayerJoinedPayload{
			UserID:   client.UserID,
			Username: client.Username,
			AvatarID: client.AvatarID,
			IsHost:   client.UserID == lobby.HostID,
			Ready:    playerReady,
		}

		payloadBytes, err := json.Marshal(playerJoined)
		if err != nil {
			log.Printf("Error marshaling player joined payload: %v", err)
			s.sendError(client, "Error joining lobby")
			return
		}

		// Notify all players in lobby about new player
		s.broadcastToLobby(lobby.ID, Message{
			Type:    "player_joined",
			Payload: payloadBytes,
		})
	}

	// Send current lobby state to the (re)joining player
	lobbyState := s.getLobbyStateJSON(lobby)
	log.Printf("Sending lobby state to player: %s", lobbyState)

	s.sendToClient(client, Message{
		Type:    "lobby_state",
		Payload: json.RawMessage(lobbyState),
	})
}

// handleLeaveLobby handles lobby leave request
func (s *WebSocketServer) handleLeaveLobby(client *Client) {
	if client.LobbyID == "" {
		return
	}

	lobby := s.manager.GetLobby(client.LobbyID)
	if lobby == nil {
		return
	}

	// Remove player from lobby
	delete(lobby.Players, client.UserID)

	// If host leaves, assign new host or close lobby
	if lobby.HostID == client.UserID && len(lobby.Players) > 0 {
		// Assign new host (first player in the map)
		for id := range lobby.Players {
			lobby.HostID = id
			// Create host changed payload
			hostChanged := HostChangedPayload{
				NewHostID: id,
			}

			payloadBytes, err := json.Marshal(hostChanged)
			if err != nil {
				s.sendError(client, "Error changing host")
				return
			}

			// Notify about new host
			s.broadcastToLobby(lobby.ID, Message{
				Type:    "host_changed",
				Payload: payloadBytes,
			})
			break
		}
	} else if len(lobby.Players) == 0 {
		// Close empty lobby
		s.manager.CloseLobby(lobby.ID)
	}

	// Create player left payload
	playerLeft := PlayerLeftPayload{
		UserID: client.UserID,
	}

	payloadBytes, err := json.Marshal(playerLeft)
	if err != nil {
		s.sendError(client, "Error leaving lobby")
		return
	}

	// Notify remaining players
	s.broadcastToLobby(lobby.ID, Message{
		Type:    "player_left",
		Payload: payloadBytes,
	})

	client.LobbyID = ""
}

// handleToggleReady handles ready status toggle
func (s *WebSocketServer) handleToggleReady(client *Client) {
	if client.LobbyID == "" {
		return
	}

	lobby := s.manager.GetLobby(client.LobbyID)
	if lobby == nil {
		return
	}

	player := lobby.Players[client.UserID]
	if player == nil {
		return
	}

	player.Ready = !player.Ready
	client.Ready = player.Ready

	// Create ready changed payload
	readyChanged := ReadyChangedPayload{
		UserID: client.UserID,
		Ready:  player.Ready,
	}

	payloadBytes, err := json.Marshal(readyChanged)
	if err != nil {
		s.sendError(client, "Error toggling ready status")
		return
	}

	// Notify all players about ready status change
	s.broadcastToLobby(lobby.ID, Message{
		Type:    "player_ready_changed",
		Payload: payloadBytes,
	})
}

// handleStartGame handles game start request
func (s *WebSocketServer) handleStartGame(client *Client) {
	if client.LobbyID == "" {
		return
	}

	lobby := s.manager.GetLobby(client.LobbyID)
	if lobby == nil {
		return
	}

	// Check if client is host
	if lobby.HostID != client.UserID {
		s.sendError(client, "Only host can start the game")
		return
	}

	// Check if all players are ready
	allReady := true
	for _, player := range lobby.Players {
		if !player.Ready {
			allReady = false
			break
		}
	}

	if !allReady {
		s.sendError(client, "All players must be ready to start")
		return
	}

	// Create game starting payload
	gameStarting := GameStartingPayload{
		LobbyID: lobby.ID,
		GameID:  lobby.GameID,
	}

	payloadBytes, err := json.Marshal(gameStarting)
	if err != nil {
		s.sendError(client, "Error starting game")
		return
	}

	// Notify all players that game is starting
	s.broadcastToLobby(lobby.ID, Message{
		Type:    "game_starting",
		Payload: payloadBytes,
	})
}

// handleReorderPlayers handles player reordering request
func (s *WebSocketServer) handleReorderPlayers(client *Client, payload json.RawMessage) {
	if client.LobbyID == "" {
		return
	}

	lobby := s.manager.GetLobby(client.LobbyID)
	if lobby == nil {
		return
	}

	// Check if client is host
	if lobby.HostID != client.UserID {
		s.sendError(client, "Only host can reorder players")
		return
	}

	var data ReorderPlayersPayload

	if err := json.Unmarshal(payload, &data); err != nil {
		s.sendError(client, "Invalid reorder request")
		return
	}

	// Notify all players about new order
	s.broadcastToLobby(client.LobbyID, Message{
		Type:    "players_reordered",
		Payload: payload,
	})
}

// broadcastToLobby sends a message to all clients in a lobby
func (s *WebSocketServer) broadcastToLobby(lobbyID string, msg Message) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, client := range s.clients {
		if client.LobbyID == lobbyID {
			s.sendToClient(client, msg)
		}
	}
}

// sendToClient sends a message to a specific client
func (s *WebSocketServer) sendToClient(client *Client, msg Message) {
	err := client.Conn.WriteJSON(msg)
	if err != nil {
		log.Printf("Error sending message to client: %v", err)
	}
}

// sendError sends an error message to a client
func (s *WebSocketServer) sendError(client *Client, message string) {
	errorPayload := ErrorPayload{
		Message: message,
	}

	payloadBytes, err := json.Marshal(errorPayload)
	if err != nil {
		log.Printf("Error marshaling error message: %v", err)
		return
	}

	s.sendToClient(client, Message{
		Type:    "error",
		Payload: payloadBytes,
	})
}
