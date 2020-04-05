# Install the app on a development environment

## Clone & install the repo

1. On a terminal window, `git clone https://github.com/coinosis/coinosis.git`
2. `cd coinosis`
3. `npm i`

## Set up the back-end: test & deploy the smart contract on a local blockchain

4. `ganache-cli`
5. On another terminal window, `cd coinosis`
6. `truffle test`
7. `truffle migrate`

## Set up the front-end: run it on a test webserver

8. `webpack-dev-server`
9. On a browser window, head to `http://localhost:9000`