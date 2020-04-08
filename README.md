# Install the app on a development environment

## Clone & install the repo

1. On a terminal window, `git clone https://github.com/coinosis/coinosis.git`
2. `cd coinosis`
3. `npm i`

## Set up the back-end: test & deploy the smart contract on a local blockchain

4. Run `npx ganache-cli` and wait for the message `Listening on 127.0.0.1:8545`
5. On another terminal window, `cd coinosis`
6. `npx truffle test`
7. `npx truffle migrate`

## Set up the front-end: run it on a test webserver

8. `npx webpack-dev-server`
9. On a browser window, head to `http://localhost:9000`
