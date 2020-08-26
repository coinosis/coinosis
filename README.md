# coinosis

Coinosis is a dApp that empowers people to share their knowledge and earn money by doing so. To know more, check out our [blog](https://medium.com/coinosis).

## repository structure

Coinosis is organized into three different repositories:

* coinosis, the current repo, is where all our smart contracts live,
* [owl](https://github.com/coinosis/owl) is our centralized back-end, and
* [cow](https://github.com/coinosis/cow) is our front-end.

## testing our latest features

We'd love your feedback on missing features, bugs and improvements. For that purpose, we have set up two live non-production environments, testing and staging. Both are automatically built from pushes to the `test` branch. You can access these environments at the following URLs:

* testing: https://testing-cow.netlify.app
* staging: https://staging-cow.netlify.app

The testing environment runs with fake money, whereas the staging environment does not.

The testing environment allows you to create events on the sokol testnet. [Here](https://www.poa.network/for-users/wallets/metamask) are some instructions on how to configure MetaMask for that testnet. Get testnet money from the [Sokol faucet](https://faucet.poa.network/). The fiat on-ramp with PayU uses the sandbox mode. It only works with specific test credit card numbers. You can get one such number [here](https://github.com/coinosis/cow/blob/test/autofill.csv).

The staging environment, on the other hand, uses real money. You need to deploy contracts on the [xDAI chain](https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup), just like in production. The fiat on-ramp uses real credit card numbers and bank information.

## contributing to coinosis

Thank you for your interest in contributing to coinosis. Depending on what you'd like to contribute to, you need to install different repositories.

* If you only want to contribute to the front-end, you only need to install [cow](https://github.com/coinosis/cow) and use our testing environment back-end. Note that, in that case, you need to use the sokol testnet to deploy contracts to.

* If you want to contribute to our centralized back-end, please install [owl](https://github.com/coinosis/owl) and [cow](https://github.com/coinosis/cow). You can configure owl to use any testnet or local blockchain.

* In any of the above cases, if you want to use a local blockchain, you can install this repo in order to have one already configured.

* If you want to contribute to our smart contract development, install this repo and, optionally, [owl](https://github.com/coinosis/owl) and [cow](https://github.com/coinosis/cow) to perform end-user tests.

# Install this repo

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

You can add as many accounts as you wish. Note that this allows you to use accounts generated from different mnemonics.

## Add owl's address to the `.owl` file

Owl (our back-end) allows users to interact with our smart contracts without crypto. In other words, it's a fiat on-ramp. In order to test that functionality, you need to fund its account. To do so, add owl's address (which can be configured in owl's `settings.json`) to a `.owl` file in this repo's root folder.

## run locally

```bash

npm run start:dev

```



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
