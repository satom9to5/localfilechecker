package handle

import (
	"net/http"
)

func Health(w http.ResponseWriter, r *http.Request) {
	responseText(w, "ok.", http.StatusOK)
}
