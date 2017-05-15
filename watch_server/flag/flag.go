package flag

import "flag"

var (
	port    = flag.Int("port", 4000, "port number. default: 4000")
	logpath = flag.String("log", "", "output log path")
	conf    = flag.String("conf", "", "watch folder config")
	debug   = flag.Bool("debug", false, "debug mode")
)

func Parse() {
	flag.Parse()
}

func Port() int {
	return *port
}

func Logpath() string {
	return *logpath
}

func Conf() string {
	return *conf
}

func Debug() bool {
	return *debug
}
