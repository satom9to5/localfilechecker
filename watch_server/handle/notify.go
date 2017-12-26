package handle

import (
	"../libs/json"
	"../notify"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, // cross domain
	}
)

func Notify(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		if _, ok := err.(websocket.HandshakeError); !ok {
			log.Println(err)
		}
		return
	}

	go writer(ws)
	reader(ws)
}

func reader(ws *websocket.Conn) {
	defer ws.Close()

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			break
		}
	}
}

func writer(ws *websocket.Conn) {
	defer func() {
		log.Println("[watch_server] url: notify closed.")
		ws.Close()
	}()

	// for folder watching
	ch := notify.GetWatchCh()

	for {
		select {
		case fei := <-ch:
			log.Println(fei)

			b, err := json.Marshal(fei)
			if err != nil {
				log.Println(err)
				return
			}
			// write byte data
			if err := ws.WriteMessage(websocket.TextMessage, b); err != nil {
				log.Println(err)
				return
			}
		}
	}
}
