module watch_server

go 1.13

require (
	github.com/gorilla/mux v1.7.3
	github.com/gorilla/websocket v1.4.1
	github.com/satom9to5/dirnotify v0.0.0-20170701235442-31e776e1af88
	github.com/satom9to5/fileinfo v0.0.0-20170701235059-df85bfdfeff5
	github.com/satom9to5/fsnotify v1.4.2 // indirect
	golang.org/x/sys v0.0.0-20191204072324-ce4227a45e2e // indirect
	pidfile v0.0.0-00010101000000-000000000000
)

replace (
	github.com/satom9to5/dirnotify v0.0.0-20170701235442-31e776e1af88 => ../../../golang/github.com/satom9to5/dirnotify
	github.com/satom9to5/fileinfo v0.0.0-20170701235059-df85bfdfeff5 => ../../../golang/github.com/satom9to5/fileinfo
	github.com/satom9to5/fsnotify v1.4.2 => ../../../golang/github.com/satom9to5/fsnotify
	pidfile => ../pidfile
)
