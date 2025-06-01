package main

import (
	"log"
	"net/http"

	"server/lobby"
)

func main() {
	// Create lobby manager
	lobbyManager := lobby.NewLobbyManager()

	// Create WebSocket server
	wsServer := lobby.NewWebSocketServer(lobbyManager)

	// Handle WebSocket connections
	http.HandleFunc("/ws", wsServer.HandleWebSocket)

	// Start server
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
