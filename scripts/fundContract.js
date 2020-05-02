const Coinosis = artifacts.require('Coinosis');

module.exports = async callback => {
  const instance = await Coinosis.deployed();
  const accounts = await web3.eth.getAccounts();
  const txObject = {
    from: accounts[0],
    to: instance.address,
    value: web3.utils.toWei('10'),
    gasPrice: web3.utils.toWei('100', 'gwei'),
  }
  const result = await web3.eth.sendTransaction(txObject); // not working
  const balance = await web3.eth.getBalance(instance.address);
  console.log(web3.utils.fromWei(balance), 'ETH');
  callback();
}
