package main

import (
	"./handle"
	"./libs/json"
	"./notify"
	"flag"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"strconv"
)

func main() {
	// command line option
	port := flag.Int("p", 4000, "port number. default: 4000")
	config := flag.String("c", "", "watch folder config")
	logPath := flag.String("l", "", "output log path")

	flag.Parse()

	setLog(logPath)
	setConfig(config)

	r := mux.NewRouter()

	// set routing
	r.HandleFunc("/health", handle.Health) // health check
	r.HandleFunc("/regist", handle.Regist)
	r.HandleFunc("/unregist/{name}", handle.Unregist)
	r.HandleFunc("/{name}/{key}", handle.FindSingle) // get single
	r.HandleFunc("/{name}", handle.FindMulti)        // get multi on JSON parameter.

	err := http.ListenAndServe(":"+strconv.Itoa(*port), r)

	if err != nil {
		log.Fatal("Start Server Failed.", err)
	}
}

// log setting
func setLog(logPath *string) {
	log.SetFlags(log.Ldate | log.Ltime)

	if logPath == nil || *logPath == "" {
		return
	}

	logFile, err := os.OpenFile(*logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal("cannot open log file.", *logPath)
		return
	}

	log.SetOutput(logFile)
}

func setConfig(config *string) {
	if config == nil || *config == "" {
		return
	}

	c := notify.Config{}

	err := json.UnmarshalString(*config, &c)
	if err != nil {
		log.Fatal("cannot Unmarshal config.", *config)
		return
	}

	err = notify.AddDirectoryInfo(c)
	if err != nil {
		log.Fatal("cannot load config.", *config)
	}
}
