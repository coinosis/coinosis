const Coinosis = artifacts.require('Coinosis');

contract('Coinosis', async accounts => {
  const nonDeployerAccounts = accounts.slice(1);
  const getBalances = async accounts => {
    const balances = [];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await web3.eth.getBalance(account);
      balances.push(BigInt(balance));
    }
    return balances;
  }
  it('should distribute one wei to every non-deployer account', async () => {
    const initialBalances = await getBalances(nonDeployerAccounts);
    const amounts = Array(nonDeployerAccounts.length).fill('1');
    const instance = await Coinosis.deployed();
    await instance.distribute(nonDeployerAccounts, amounts, {
      value: String(nonDeployerAccounts.length),
    });
    const finalBalances = await getBalances(nonDeployerAccounts);
    for (let i = 0; i < nonDeployerAccounts.length; i++) {
      const initialBalance = initialBalances[i];
      const finalBalance = finalBalances[i];
      assert.equal(
        finalBalance,
        initialBalance + 1n
      );
    }
  });
  it('should revert with a different-lengths error',
     async () => {
       let errorThrown = false;
       const instance = await Coinosis.deployed();
       const amounts = Array(nonDeployerAccounts.length - 1).fill('1');
       const value = nonDeployerAccounts.length * 2;
       try {
         await instance.distribute(nonDeployerAccounts, amounts, { value });
       }
       catch (err) {
         assert.include(
           err.message,
           'different-lengths',
           'The error thrown isn\'t different-lengths: ' + err.message
         );
         errorThrown = true;
       }
       if (!errorThrown) {
         assert.fail('No error thrown.');
       }
     });
  it('should revert with a insufficient-value error', async () => {
    let errorThrown = false;
    const amounts = Array(nonDeployerAccounts.length).fill('1');
    const instance = await Coinosis.deployed();
    const value = nonDeployerAccounts.length - 1;
    try {
      await instance.distribute(nonDeployerAccounts, amounts, { value });
    }
    catch (err) {
      assert.include(
        err.message,
        'insufficient-value',
        'The error thrown isn\'t insufficient-value: ' + err.message
      );
      errorThrown = true;
    }
    if (!errorThrown) {
      assert.fail('No error thrown.');
    }
  });
});
