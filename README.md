## Install the app on a development environment

### Clone & install the repo

1. On a terminal window, `git clone https://github.com/coinosis/coinosis.git -b dev`
2. `cd coinosis`
3. `npm i`

### Set up the back-end: test & deploy the smart contract on a local blockchain

4. Run `npx ganache-cli` and wait for the message `Listening on 127.0.0.1:8545`
5. On another terminal window, `cd coinosis`
6. `npx truffle test`
7. `npx truffle migrate`

### Set up the front-end: run it on a test webserver

8. `npx webpack-dev-server`
9. On a browser window, head to `http://localhost:9000`

## Submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch
3. Once accepted, check everything is working in [the test deployment](https://coinosis-front.herokuapp.com)
4. Create a pull request targeting the `master` branch
5. Once accepted the code will be running live in [the production deployment](https://coinosis.github.io)

## Interact with the deployed contract from the command line

```bash

git clone https://github.com/coinosis/coinosis.git -b master
cd coinosis
npm i
truffle console --network mainnet

gasPrice = web3.utils.toWei('7.5', 'gwei') // get the latest gas price from https://etherscan.io/gastracker
instance = await Coinosis.deployed()
result = await web3.eth.sendTransaction({from: accounts[0], to: instance.address, value: web3.utils.toWei('1'), gasPrice})

registrationPriceUSDWei = web3.utils.toWei('5.00')
ETHPriceUSDWei = web3.utils.toWei('187.79')
names = ['Alejandra Arias', 'Valentina Jaramillo', 'Laura Acosta']
addresses = ['0x3eBe044eAE12599b396CF779eE8124c5900B13a2', '0xB6E0fDeFB8D65D50cc5eEd77F79e46E10d749DE4', '0xEB13677C9B17746b7C1ac717A3113087e075E191']
claps = [8, 10, 4]
result = await instance.assess(registrationPriceUSDWei, ETHPriceUSDWei, names, addresses, claps, {gasPrice})

```

## Deploy the contract to Ropsten or to Mainnet

1. create a new Ethereum account
2. fund that account on the desired network
3. store its 12-word mnemonic in `.secret`
4. run `truffle migrate --reset --network ropsten`

## Flatten the contract in order to verify it on Etherscan

1. Make sure you're in the `master` branch and it is synced with GitHub
2. `truffle-flattener contracts/Coinosis.sol > build/contracts/Coinosis.sol`
3. Copy the contents of `build/contracts/Coinosis.sol` into the Etherscan source verifier

## Build the front-end for production

1. Make sure you're in the `master` branch and it is synced with GitHub
2. `webpack -p`
3. Copy the contents of the `dist/` folder to your webserver

## Execute the assess() function in the development environment

```bash

ganache-cli
truffle migrate
truffle exec scripts/fundContract.js
truffle exec scripts/assess.js

```

## Execute the assess() function in other environments

`ENVIRONMENT=testing truffle exec scripts/assess.js --network ropsten`

* set the ENVIRONMENT environment variable to `production` if you want to get data from that database
* set the --network flag to `mainnet` if you want to execute the contract on that network
