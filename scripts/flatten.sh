#! /bin/bash

truffle-flattener contracts/Event.sol > build/flattened/Event.sol
echo "contracts/Event.sol -> build/flattened/"
truffle-flattener contracts/ProxyEvent.sol > build/flattened/ProxyEvent.sol
echo "contracts/ProxyEvent.sol -> build/flattened/"
