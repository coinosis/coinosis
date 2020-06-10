#! /bin/bash

truffle-flattener contracts/Event.sol > build/flattened/Event.sol
truffle-flattener contracts/ProxyEvent.sol > build/flattened/ProxyEvent.sol
