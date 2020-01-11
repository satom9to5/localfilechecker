package handle

import (
	"net/http"
	// in project
	"watch_server/libs/json"
	"watch_server/notify"
)

func Summaries(w http.ResponseWriter, r *http.Request) {
	js, err := json.MarshalString(notify.GetDirectoryInfoSummaries())

	if err != nil {
		responseText(w, "JSON Marshal error.", http.StatusInternalServerError)
		return
	}

	responseJson(w, js, http.StatusOK)
}
