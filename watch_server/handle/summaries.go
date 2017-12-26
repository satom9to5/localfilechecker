package handle

import (
	"../libs/json"
	"../notify"
	"net/http"
)

func Summaries(w http.ResponseWriter, r *http.Request) {
	js, err := json.MarshalString(notify.GetDirectoryInfoSummaries())

	if err != nil {
		responseText(w, "JSON Marshal error.", http.StatusInternalServerError)
		return
	}

	responseJson(w, js, http.StatusOK)
}
