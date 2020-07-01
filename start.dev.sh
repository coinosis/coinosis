#! /bin/bash

ganache-cli --networkId 1337 --blockTime 30 $(cat .accounts) &
GANACHE_PID=$!
truffle exec scripts/fundAccount.js
wait $GANACHE_PID
