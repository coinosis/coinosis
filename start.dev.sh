#! /bin/bash

ganache-cli -i 1337 &
truffle migrate
webpack-dev-server
