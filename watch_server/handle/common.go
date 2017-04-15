package handle

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
)

func ReadBody(i io.Reader) []byte {
	bytes, err := ioutil.ReadAll(i)
	if err != nil || len(bytes) == 0 {
		return nil
	}

	return bytes
}

func responseText(w http.ResponseWriter, body interface{}, statusCode int) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	setPreflightHeader(w)

	if statusCode > 0 {
		w.WriteHeader(statusCode)
	}

	fmt.Fprintln(w, body)
}

func responseJson(w http.ResponseWriter, body interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	setPreflightHeader(w)

	if statusCode > 0 {
		w.WriteHeader(statusCode)
	}

	fmt.Fprintln(w, body)
}

func setPreflightHeader(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Credentials", "false")
}
