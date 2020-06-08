## Using the contract for front-end development

```bash

git clone https://github.com/coinosis/coinosis.git -b master
cd coinosis
npm install
npm run start:local
truffle exec scripts/fundAccount.js <your metamask account>

```
Reset your browser's metamask account (settings > advanced > reset account).
If you need support for events created with older contracts (<2.0.0), run `truffle migrate`.

## Contract Development

### Clone & install

```bash

git clone https://github.com/coinosis/coinosis.git -b dev
cd coinosis
npm install

```

### Run the local blockchain and the tests

```bash

ganache-cli -i 1337 -s coinosis
truffle test

```

`Coinosis.sol` is a deprecated contract retained for backwards-compatibility reasons. It used to be a global contract deployed as part of the app inner workings. If you want to deploy that contract, use `truffle migrate`.

The `Event.sol` contract is the current (v2.0.0 onwards) contract. It is deployed every time a user creates a new event and holds the funds for that event only. If you want to deploy it and interact with it, you can do it with `truffle console`. See the tests for examples of how to do this.

## Contract Deployment

1. Run `truffle compile`
2. Copy the generated file `build/contracts/Event.json` to the root directory of [cow](https://github.com/coinosis/cow), the front-end for coinosis. You can use `scripts/migrate.sh` for that.

### Verify the contract on Etherscan

1. Run `truffle-flattener contracts/Event.sol > build/flattened/Event.sol`
2. Copy the contents of `build/flattened/Event.sol` into the Etherscan source verifier
3. Copy the ABI hex encoded initialization parameters into Etherscan

## Submit your changes

1. Commit & push to the `dev` branch
2. Create a pull request targeting the `test` branch
