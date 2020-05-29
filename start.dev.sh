#! /bin/bash

ganache-cli --networkId 1337 --seed coinosis &
truffle migrate
webpack-dev-server
