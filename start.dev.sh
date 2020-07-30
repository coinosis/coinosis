#! /bin/bash

ganache-cli --blockTime 15 $(cat .accounts) &
GANACHE_PID=$!
truffle exec scripts/fundAccount.js
wait $GANACHE_PID
