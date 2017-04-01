package main

import (
	"../pidfile"
	"./handle"
	"./libs/json"
	"./notify"
	"flag"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
)

func main() {
	// command line option
	port := flag.Int("p", 4000, "port number. default: 4000")
	logPath := flag.String("log", "", "output log path")
	config := flag.String("conf", "", "watch folder config")

	flag.Parse()

	pidfileCheck()
	setLog(logPath)
	setConfig(config)

	r := mux.NewRouter()

	// set routing
	r.HandleFunc("/health", handle.Health) // health check
	r.HandleFunc("/regist", handle.Regist)
	r.HandleFunc("/unregist/{name}", handle.Unregist)
	r.HandleFunc("/{name}/{key}", handle.FindSingle) // get single
	r.HandleFunc("/{name}", handle.FindMulti)        // get multi on JSON parameter.

	log.Println("Starting Server...")

	go func() {
		err := http.ListenAndServe(":"+strconv.Itoa(*port), r)

		if err != nil {
			log.Fatal("Start Server Failed.", err)
		}
	}()

	// Wait Signal
	ch := make(chan os.Signal)
	signal.Notify(ch, os.Interrupt, os.Kill)

	// Server shutdown
	<-ch
	pidfile.Remove()
	os.Exit(1)
}

func pidfileCheck() {
	pid, _ := pidfile.Read()
	if pid > 0 {
		log.Fatal("Server is already Running.")
		return
	}

	if err := pidfile.Write(); err != nil {
		log.Fatal(err)
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
