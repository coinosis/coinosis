# coinosis

Coinosis is a dApp that empowers people to share their knowledge and earn money by doing so. To know more, check out our [blog](https://medium.com/coinosis).

## repository structure

Coinosis is organized into three different repositories:

* coinosis, the current repo, is where all our smart contracts live,
* [cow](https://github.com/coinosis/cow) is our front-end, and
* [owl](https://github.com/coinosis/owl) is our back-end.

In order to set up your local development environment, install these three repos.

# Install coinosis

## clone & install

```bash

git clone https://github.com/coinosis/coinosis.git
cd coinosis
npm install

```

## Add your development accounts to the `.accounts` file

Create a file called `.accounts` and add your dev accounts' private keys using the following format:

```

--account <0x-prefixed private key>,100000000000000000000 --account <0x-prefixed private key>,100000000000000000000 --account <0x-prefixed private-key>,100000000000000000000

```

You can add as many accounts as you wish.

## run locally

```bash

npm run start:dev

```

## testing and staging environments

Both testing and staging environments are automatically built from every push to the `test` branch. You can access these environments at the following URLs:

* testing: https://testing-cow.netlify.app
* staging: https://staging-cow.netlify.app

The testing environment runs with fake money, whereas the staging environment runs with real money.

The testing environment allows you to create events on the sokol testnet. [Here](https://www.poa.network/for-users/wallets/metamask) are some instructions on how to configure MetaMask for that testnet. Get testnet money from the [Sokol faucet](https://faucet.poa.network/). The fiat on-ramp with PayU uses the sandbox mode. It only works with specific test credit card numbers. You can get one such number [here](https://github.com/coinosis/cow/blob/test/autofill.csv).

The staging environment, on the other hand, uses real money. You need to deploy contracts on the xDAI chain, just like in production. The fiat on-ramp uses real credit card numbers and bank information. But since it is intended for testing, please [ask us](mailto:e18r@disroot.org) for a refund of any test you make in this environment.

# Contribute to this repo

## run the tests

```bash

npm test

```

or, for more fine-grained control,

```bash

ganache-cli -a <number-of-accounts>
truffle test test/<file-to-test>

```

## about the different contracts

* `Coinosis.sol` is a deprecated contract retained for backwards-compatibility reasons. It used to be a global contract deployed as part of the app inner workings. If you're interested in deploy that contract, refer to [deploying older contracts](#deploying-older-contracts);

* The `Event.sol` contract is the current (v2.0.0 onwards) contract. It is deployed every time a user creates a new event and holds the funds for that event only. If you want to deploy it and interact with it, you can do it with `truffle console`. See the tests for examples of how to do this.

* The `ProxyEvent.sol` inherits from `Event.sol` and extends its functionality allowing for proxy registering and clapping.

## contract deployment

1. Run `npm run flatten`
2. Run `npm run compile`
3. Assuming both [cow](https://github.com/coinosis/cow) and [owl](https://github.com/coinosis/owl) are installed in the same folder as this repo, run `npm run copy` to copy the ABI files to both projects, and the BIN files to cow.

* You can also run `npm run export` to run the above three steps with one command.

## verify the contracts on Etherscan

1. Run `scripts/flatten.sh`
2. The flattened contracts will be available in `build/flattened/`
3. Copy the source code of the contract of your choosing into the Etherscan source verifier
4. Copy the ABI hex encoded initialization parameters into Etherscan

Note that you don't need to do this for every contract deployed. Etherscan will notice when a similar contract has been deployed to the network.

## submit your changes

Create a pull request targeting the `trunk` branch.

## deploying older contracts

* In order to create local distributions for events created with v1 contracts, you need to do the following:

* create a `.secret` file at the root of your repo with the 12-word mnemonic of your metamask development account.

```bash

npm run start:dev
truffle migrate
truffle exec scripts/fundContracts
ENVIRONMENT=development truffle exec scripts/assess.js <event-name> <dollar-amount-per-person> --network development

```
