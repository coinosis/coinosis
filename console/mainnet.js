migrate --network mainnet
instance = await Coinosis.deployed()
web3.eth.sendTransaction({from: accounts[0], to: instance.address, value: web3.utils.toWei('1')})

const assessment = await instance.assess(registrationFeeUSDWei, ETHPriceUSDWei, names, addresses, claps, { gasPrice })
