const Coinosis = artifacts.require('Coinosis');

module.exports = async callback => {
  const instance = await Coinosis.deployed();
  const accounts = await web3.eth.getAccounts();
  const txObject = {
    from: accounts[0],
    to: instance.address,
    value: web3.utils.toWei('2'),
    gasPrice: web3.utils.toWei('100', 'gwei'),
  }
  const result = await web3.eth.sendTransaction({txObject}); // not working
  console.log(result);
  callback();
}
