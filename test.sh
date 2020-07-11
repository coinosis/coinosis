#! /bin/bash

ganache-cli > /dev/null &
GANACHE_PID=$!
truffle test
kill $GANACHE_PID
