module.exports = async callback => {
  const recipient = (process.argv.length > 4 && process.argv[4])
        || '0xe1fF19182deb2058016Ae0627c1E4660A895196a';
  const accounts = await web3.eth.getAccounts();
  const txObject = {
    from: accounts[0],
    to: recipient,
    value: web3.utils.toWei('1'),
    gasPrice: web3.utils.toWei('100', 'gwei'),
  }
  const result = await web3.eth.sendTransaction(txObject);
  const balance = await web3.eth.getBalance(recipient);
  const balanceETH = web3.utils.fromWei(balance);
  console.log(`${recipient}: ${balanceETH} ETH`);
  callback();
}