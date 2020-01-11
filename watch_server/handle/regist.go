package handle

import (
	"log"
	"net/http"
	// outer
	"github.com/gorilla/mux"
	// in project
	"watch_server/config"
	"watch_server/libs/json"
	"watch_server/notify"
)

func Regist(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		responseText(w, "Method is not POST.", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes := ReadBody(r.Body)
	if bodyBytes == nil {
		responseText(w, "Body is empty.", http.StatusBadRequest)
		return
	}

	config := config.Config{}

	err := json.Unmarshal(bodyBytes, &config)
	if err != nil {
		log.Println("Cannot unmarshal json.", err)
		responseText(w, "Cannot unmarshale json.", http.StatusBadRequest)
		return
	}

	err = notify.AddDirectoryInfo(config)
	if err != nil {
		log.Println("Cannot add config.", err)
		responseText(w, "Cannot add config.", http.StatusInternalServerError)
		return
	}

	responseText(w, "Regist ok.", http.StatusOK)
}

func Unregist(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		responseText(w, "Method is not GET.", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	name := vars["name"]

	err := notify.RemoveDirectoryInfo(name)
	if err != nil {
		log.Println("Cannot remove conifg.", err)
		responseText(w, "Cannot remove config.", http.StatusInternalServerError)
	}

	responseText(w, "Unregist ok.", http.StatusOK)
}
