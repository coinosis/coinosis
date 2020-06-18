## clone & install

```bash

git clone https://github.com/coinosis/coinosis.git -b master
cd coinosis
npm install

```

## connect to your metamask account

create a `.secret` file at the root of your repo with the 12-word mnemonic of your metamask development account.

## run

```bash

npm run start:dev

```

* You might need to reset your browser's metamask account's transaction history (settings > advanced > reset account).

## run the tests

```bash

truffle test

```

## about the different contracts

* `Coinosis.sol` is a deprecated contract retained for backwards-compatibility reasons. It used to be a global contract deployed as part of the app inner workings. If you want to deploy that contract, use `truffle migrate`.

* The `Event.sol` contract is the current (v2.0.0 onwards) contract. It is deployed every time a user creates a new event and holds the funds for that event only. If you want to deploy it and interact with it, you can do it with `truffle console`. See the tests for examples of how to do this.

* The `ProxyEvent.sol` inherits from `Event.sol` and extends its functionality allowing for proxy registering and clapping.

## contract deployment

1. Run `npm run flatten`
2. Run `npm run compile`
3. Assuming both [cow](https://github.com/coinosis/cow) and [owl](https://github.com/coinosis/owl) are installed in the same folder as this repo, run `npm run copy` to copy the ABI files to both projects, and the BIN files to cow.

## verify the contracts on Etherscan

1. Run `scripts/flatten.sh`
2. The flattened contracts will be available in `build/flattened/`
3. Copy the source code of the contract of your choosing into the Etherscan source verifier
4. Copy the ABI hex encoded initialization parameters into Etherscan

Note that you don't need to do this for every contract deployed. Etherscan will notice when a similar contract has been deployed to the network.

## submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch

## deploying older contracts

* In order to create local distributions for events created with v1 contracts, you need to do the following:

```bash

npm run start:dev
truffle migrate
truffle exec scripts/fundContracts
ENVIRONMENT=development truffle exec scripts/assess.js <event-name> <dollar-amount-per-person> --network development

```
