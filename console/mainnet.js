migrate --network mainnet
instance = await Coinosis.deployed()
// fund contract

gasPrice = web3.utils.toWei('gwei', '') // https://etherscan.io/gastracker
const assessment = await instance.assess(registrationFeeUSDWei, ETHPriceUSDWei, names, addresses, claps, { gasPrice })
