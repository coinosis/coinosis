## Using the contract for front-end development

```bash

git clone https://github.com/coinosis/coinosis.git -b master
cd coinosis
npm install
npm run start:local
truffle exec scripts/fundAccount.js <your metamask account>

```

## Contract Development

### Clone & install the repo

```bash

git clone https://github.com/coinosis/coinosis.git -b dev
cd coinosis
npm install

```

### Run the tests and deploy the contract to the local blockchain

```bash

ganache-cli -i 1337 -s coinosis
truffle test
truffle migrate

```

You might need to specify the `--reset` flag to `truffle migrate`.

### Customize and execute the different scripts that call contract functions

```bash

ganache-cli
truffle migrate
truffle exec scripts/fundContract.js --network development
ENVIRONMENT=development truffle exec scripts/assess.js event-name dollar-amount --network development
truffle exec scripts/decommission.js --network development

```

Note: the ENVIRONMENT env var determines the owl instance where the data is going to be extracted from. If you set it to development, such as in this example, you have to be running owl locally.

## Contract Deployment

### Deploy the contract to a testnet or to mainnet

1. create a new Ethereum account
2. fund that account on the desired network
3. store its 12-word mnemonic in `.secret`
4. run `truffle migrate --reset --network ropsten # or the network of your choosing`

### Flatten the contract in order to verify it on Etherscan

1. Make sure you're in the `master` branch and it is synced with GitHub
2. `truffle-flattener contracts/Coinosis.sol > build/contracts/Coinosis.sol`
3. Copy the contents of `build/contracts/Coinosis.sol` into the Etherscan source verifier

## Submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch

## Execute the scripts in a non-development context

```bash

ENVIRONMENT=testing truffle exec scripts/assess.js --network ropsten
truffle exec scripts/decommission.js --network ropsten

```

* set the ENVIRONMENT environment variable to `production` if you want to get data from that database
* set the --network flag to `mainnet` if you want to execute the contract on that network
