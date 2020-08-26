#! /bin/bash

ganache-cli --blockTime 10 $(cat .accounts) &
GANACHE_PID=$!
truffle exec scripts/fundAccount.js $(cat .owl)
wait $GANACHE_PID
