module app

go 1.13

require (
	github.com/mitchellh/go-ps v0.0.0-20190716172923-621e5597135b
	pidfile v0.0.0-00010101000000-000000000000
	watch_server v0.0.0-00010101000000-000000000000
)

replace (
	pidfile => ../pidfile
	watch_server => ../watch_server
)
