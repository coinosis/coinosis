module.exports = async callback => {
  const recipients = [
    '0xe1fF19182deb2058016Ae0627c1E4660A895196a',
    '0x65ce6578ceA65E5779f0769901D2d4158bf37F53',
    '0x1b888AeB1F7BBb66743D29dB2f3eAb127682F91D',
    '0x454897AA40bE7F96d12242AECE0881A7fbd8983b',
    '0x3Ef31DF478ff3662f5F24D5211dD746c83441F70',
    '0x43Db4728D5607F710DfC062b3c7dD8eE942eF858',
    '0x9d4Aef8EC71E181932c67148e7459084034cA1F5',
    '0x4c28293e79CfBD8C36A84FA23DEb7Bb2515C09c3',
    '0x613e7398e4a14903d340a8BcB629E3EFdb2aF8b0',
    '0x42635E76953a938095AaD51B126c3332808F2FA1',
    '0x8Cfd0dE4eac46AbF1211D2077EEE59fc3FbE1BD8',
    '0xDcdAE484F8B68894103e68fA4c6F90b2a0E71E6c',
  ];
  const accounts = await web3.eth.getAccounts();
  for (const i in recipients) {
    const txObject = {
      from: accounts[0],
      to: recipients[i],
      value: web3.utils.toWei('1'),
      gasPrice: web3.utils.toWei('100', 'gwei'),
    }
    const result = await web3.eth.sendTransaction(txObject);
    const balance = await web3.eth.getBalance(recipients[i]);
    console.log(web3.utils.fromWei(balance), 'ETH');
  }
  callback();
}
