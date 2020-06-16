#! /bin/bash

ganache-cli --networkId 1337 --mnemonic "$(cat .secret)" --blockTime 30
