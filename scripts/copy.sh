#! /bin/bash

cp build/solc/Event.abi ../cow/contracts/Event.abi.json
cp build/solc/Event.bin ../cow/contracts/Event.bin.txt
echo "build/solc/Event.{abi,bin} -> ../cow/contracts/"
cp build/solc/ProxyEvent.abi ../cow/contracts/ProxyEvent.abi.json
cp build/solc/ProxyEvent.bin ../cow/contracts/ProxyEvent.bin.txt
echo "build/solc/ProxyEvent.{abi,bin} -> ../cow/contracts/"

cp build/solc/ProxyEvent.abi ../owl/contracts/ProxyEvent.abi.json
echo "build/solc/ProxyEvent.abi -> ../owl/contracts/"
