package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Player represents a connected client
type Player struct {
	ID   string
	Conn *websocket.Conn
}

// Lobby holds players and broadcast channel
type Lobby struct {
	ID      string
	Players map[string]*Player
	Mutex   sync.Mutex
}

var (
	lobbies   = make(map[string]*Lobby)
	lobbiesMu sync.Mutex
	upgrader  = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

// createLobby initializes a new lobby
func createLobby(id string) *Lobby {
	lobbiesMu.Lock()
	defer lobbiesMu.Unlock()

	l := &Lobby{
		ID:      id,
		Players: make(map[string]*Player),
	}
	lobbies[id] = l
	return l
}

// getLobby fetches existing lobby or creates one
func getLobby(id string) *Lobby {
	lobbiesMu.Lock()
	l, ok := lobbies[id]
	lobbiesMu.Unlock()
	if !ok {
		return createLobby(id)
	}
	return l
}

// handleWebSocket upgrades connection and registers player
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.URL.Query().Get("lobbyId")
	playerID := r.URL.Query().Get("playerId")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	lobby := getLobby(lobbyID)
	player := &Player{ID: playerID, Conn: conn}

	lobby.Mutex.Lock()
	lobby.Players[playerID] = player
	lobby.Mutex.Unlock()

	go readPump(lobby, player)
}

// readPump handles incoming messages
func readPump(lobby *Lobby, player *Player) {
	defer func() {
		lobby.Mutex.Lock()
		delete(lobby.Players, player.ID)
		lobby.Mutex.Unlock()
		player.Conn.Close()
	}()

	for {
		_, msg, err := player.Conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
		// For now, broadcast raw message to all players
		dispatch(lobby, msg)
	}
}

// dispatch sends message to all players in lobby
func dispatch(lobby *Lobby, msg []byte) {
	lobby.Mutex.Lock()
	defer lobby.Mutex.Unlock()

	for _, p := range lobby.Players {
		err := p.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Write error:", err)
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	log.Println("Server start on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
