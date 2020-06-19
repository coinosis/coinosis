#! /bin/bash

ganache-cli --networkId 1337 --mnemonic "$(cat .secret)" --blockTime 30 &
GANACHE_PID=$!
truffle exec scripts/fundAccount.js
wait $GANACHE_PID
