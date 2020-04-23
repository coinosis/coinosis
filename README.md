## Install the app on a development environment

### Clone & install the repo

1. On a terminal window, `git clone https://github.com/coinosis/coinosis.git`
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

## Interact with the deployed contract from the command line

```bash
truffle console --network mainnet

gasPrice = web3.utils.toWei('7.5', 'gwei') // ethgasstation.info

instance = await Coinosis.deployed()

result = await web3.eth.sendTransaction({from: accounts[0], to: instance.address, value: web3.utils.toWei('1'), gasPrice})

registrationPriceUSDWei = web3.utils.toWei('5.00')
ETHPriceUSDWei = web3.utils.toWei('187.79')
names = ['Alejandra Arias', 'Valentina Jaramillo', 'Laura Acosta']
addresses = ['0x3eBe044eAE12599b396CF779eE8124c5900B13a2', '0xB6E0fDeFB8D65D50cc5eEd77F79e46E10d749DE4', '0xEB13677C9B17746b7C1ac717A3113087e075E191']
claps = [8, 10, 4]
result = await instance.assess(registrationPriceUSDWei, ETHPriceUSDWei, names, addresses, claps, {gasPrice})
```

## Flatten the contract in order to verify it on Etherscan

1. `truffle-flattener contracts/Coinosis.sol > build/contracts/Coinosis.sol`
2. Copy the contents of `build/contracts/Coinosis.sol` into the Etherscan source verifier

## Build the front-end for production

1. `webpack -p`
2. Copy the contents of the `dist/` folder to your webserver
