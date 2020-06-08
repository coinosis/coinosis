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

npm run start:local

```

* You might need to reset your browser's metamask account (settings > advanced > reset account).
* If you need support for events created with older contracts (<2.0.0), run `truffle migrate`.

## run the tests

```bash

truffle test

```

## on the available contracts

* `Coinosis.sol` is a deprecated contract retained for backwards-compatibility reasons. It used to be a global contract deployed as part of the app inner workings. If you want to deploy that contract, use `truffle migrate`.

* The `Event.sol` contract is the current (v2.0.0 onwards) contract. It is deployed every time a user creates a new event and holds the funds for that event only. If you want to deploy it and interact with it, you can do it with `truffle console`. See the tests for examples of how to do this.

## contract deployment

1. Run `truffle compile`
2. Copy the generated file `build/contracts/Event.json` to the root directory of [cow](https://github.com/coinosis/cow), the front-end for coinosis. You can use `scripts/migrate.sh` for that.

## verify the contract on Etherscan

1. Run `truffle-flattener contracts/Event.sol > build/flattened/Event.sol`
2. Copy the contents of `build/flattened/Event.sol` into the Etherscan source verifier
3. Copy the ABI hex encoded initialization parameters into Etherscan

Note that you don't need to do this for every contract deployed. Etherscan will notice when a similar contract has been deployed to the network.

## submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch
