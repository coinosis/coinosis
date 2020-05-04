## Prerequisites

Install and run [owl](https://github.com/coinosis/owl), the centralized back-end of coinosis.

## Development: clone & install the repo

```bash

git clone https://github.com/coinosis/coinosis.git -b dev
cd coinosis
npm i

```

### Front-end development: deploy the contract on a local blockchain and run the front-end

```bash

npm run start:dev

```

Point your browser to `http://localhost:9000`, point Metamask to `localhost:8545` and start developing with hot module replacement.

### Contract development

#### Create and run the tests, and deploy the contract to the local blockchain

```bash

ganache-cli
truffle test
truffle migrate

```

You might need to specify the `--reset` flag to `truffle migrate`.

#### Customize and execute the different scripts that call contract functions

```bash

ganache-cli
truffle migrate
truffle exec scripts/fundContract.js
truffle exec scripts/assess.js

```

#### Deploy the contract to a testnet or to mainnet

1. create a new Ethereum account
2. fund that account on the desired network
3. store its 12-word mnemonic in `.secret`
4. run `truffle migrate --reset --network ropsten`

### Flatten the contract in order to verify it on Etherscan

1. Make sure you're in the `master` branch and it is synced with GitHub
2. `truffle-flattener contracts/Coinosis.sol > build/contracts/Coinosis.sol`
3. Copy the contents of `build/contracts/Coinosis.sol` into the Etherscan source verifier

## Submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch
3. Once accepted, check everything is working in [the test deployment](https://coinosis-front.herokuapp.com)
4. Create a pull request targeting the `master` branch
5. Once accepted the code will be running live in [the production deployment](https://coinosis.github.io)

## Production

### Build the front-end for production

1. Make sure you're in the `master` branch and it is synced with GitHub
2. Run `webpack -p`
3. Copy the contents of the `dist/` folder to your webserver

### Execute the assess() function in a non-development context

`ENVIRONMENT=testing truffle exec scripts/assess.js --network ropsten`

* set the ENVIRONMENT environment variable to `production` if you want to get data from that database
* set the --network flag to `mainnet` if you want to execute the contract on that network
