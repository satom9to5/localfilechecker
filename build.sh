#!/bin/sh

CURDIR=$(cd $(dirname $0) && pwd)

for dir in app watch_server
do
  mkdir -p $dir/bin

  cd $dir

  echo "build $dir/linux64"
  GOOS=linux GOARCH=amd64   go build -o ./bin/linux64
  echo "build $dir/win64"
  GOOS=windows GOARCH=amd64 go build -o ./bin/win64.exe
  echo "build $dir/darwin64"
  GOOS=darwin GOARCH=amd64  go build -o ./bin/darwin64

  cd $CURDIR
done
