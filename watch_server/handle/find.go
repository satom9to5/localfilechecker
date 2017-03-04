package handle

import (
	"../libs/json"
	"../notify"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func FindSingle(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		responseText(w, "Method is not GET.", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	name := vars["name"]
	key := vars["key"]

	js, err := json.MarshalString(notify.Get(name, key))
	if err != nil {
		responseText(w, "JSON Marshal error.", http.StatusInternalServerError)
		return
	}

	responseJson(w, js, http.StatusOK)
}

func FindMulti(w http.ResponseWriter, r *http.Request) {
	keys := []string{}

	switch r.Method {
	case "GET":
		// get all
	case "POST":
		// read body
		bodyBytes := ReadBody(r.Body)
		if bodyBytes == nil {
			responseText(w, "Body is empty.", http.StatusBadRequest)
			return
		}

		err := json.Unmarshal(bodyBytes, &keys)
		if err != nil {
			log.Println("Cannot unmarshal json.", err)
			responseText(w, "Cannot unmarshale json.", http.StatusBadRequest)
			return
		}
	default:
		responseText(w, "Method is not GET/POST.", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	name := vars["name"]

	js := ""
	var err error

	if len(keys) == 0 {
		// GET
		js, err = json.MarshalString(notify.GetAll(name))
	} else {
		// POST
		js, err = json.MarshalString(notify.GetMulti(name, keys))
	}

	if err != nil {
		log.Println("Json Marshal failed", err)
		responseText(w, "System error.", http.StatusInternalServerError)
		return
	}

	responseJson(w, js, http.StatusOK)
}
