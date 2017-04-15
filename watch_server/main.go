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
	logpath = flag.String("log", "", "output log path")
	config  = flag.String("conf", "", "watch folder config")
)

func main() {
	flag.Parse()

	pidfileCheck()
	setLog()
	setConfig()

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
		shutdown(err)
	}
}

// log setting
func setLog() {
	log.SetFlags(log.Ldate | log.Ltime)

	if logpath == nil || *logpath == "" {
		return
	}

	logFile, err := os.OpenFile(*logpath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		shutdown("cannot open log file.", *logpath)
	}

	log.SetOutput(logFile)
}

func setConfig() {
	if config == nil || *config == "" {
		return
	}

	confs := []notify.Config{}

	err := json.UnmarshalString(*config, &confs)
	if err != nil {
		shutdown("cannot Unmarshal config.", *config, err)
	}

	for _, c := range confs {
		err = notify.AddDirectoryInfo(c)
		if err != nil {
			shutdown("cannot load config.", c, err)
		}
	}
}

func shutdown(v ...interface{}) {
	exitStatus := 0

	if len(v) > 0 {
		exitStatus = 1
		log.Println(v...)
	}

	log.Println("Shutdown server...")

	pidfile.Remove()
	os.Exit(exitStatus)
}
