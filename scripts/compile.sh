#! /bin/bash

solc --output-dir build/solc/ --overwrite --abi --bin --optimize \
     --optimize-runs 32 build/flattened/Event.sol > /dev/null &&
echo "build/flattened/Event.sol -> build/solc/Event.{abi,bin}"
solc --output-dir build/solc/ --overwrite --abi --bin --optimize \
     --optimize-runs 32 build/flattened/ProxyEvent.sol > /dev/null &&
echo "build/flattened/ProxyEvent.sol -> build/solc/ProxyEvent.{abi,bin}"
