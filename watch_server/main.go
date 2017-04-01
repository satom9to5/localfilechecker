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

var (
	port    = flag.Int("port", 4000, "port number. default: 4000")
	logPath = flag.String("log", "", "output log path")
	config  = flag.String("conf", "", "watch folder config")
)

func main() {
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
			shutdown("Start Server Failed.", err)
		}
	}()

	// Wait Signal
	ch := make(chan os.Signal)
	signal.Notify(ch, os.Interrupt, os.Kill)

	// Server shutdown
	<-ch
	shutdown()
}

func pidfileCheck() {
	pid, _ := pidfile.Read()
	if pid > 0 {
		shutdown("Server is already Running.")
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
		shutdown("cannot open log file.", *logPath)
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
		shutdown("cannot Unmarshal config.", *config)
	}

	err = notify.AddDirectoryInfo(c)
	if err != nil {
		shutdown("cannot load config.", *config)
	}
}

func shutdown(v ...interface{}) {
	exitStatus := 0

	if len(v) > 0 {
		exitStatus = 1
		log.Println(v...)
	}

	pidfile.Remove()
	os.Exit(exitStatus)
}
