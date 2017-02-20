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
	if statusCode > 0 {
		w.WriteHeader(statusCode)
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")

	fmt.Fprintln(w, body)
}

func responseJson(w http.ResponseWriter, body interface{}, statusCode int) {
	if statusCode > 0 {
		w.WriteHeader(statusCode)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	fmt.Fprintln(w, body)
}
