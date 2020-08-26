module.exports = async callback => {
  let transactions = [];
  const latestBlock = await web3.eth.getBlock('latest', true);
  const latestNumber = latestBlock.number;
  for (let number = latestNumber; number > 0; number--) {
    const block = await web3.eth.getBlock(number, true);
    transactions = transactions.concat(block.transactions);
  }
  console.log(transactions.map(tx => {
    return {
      blockNumber: tx.blockNumber,
      txHash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
    };
  }));
  callback();
}
