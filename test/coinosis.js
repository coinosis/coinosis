const Coinosis = artifacts.require('Coinosis');
const truffleAssert = require('truffle-assertions');

contract('Coinosis', async accounts => {

  contract('receive()', async accounts => {
    const coinosisAccount = '0xe1fF19182deb2058016Ae0627c1E4660A895196a';
    it('should transfer one wei to the coinosis account', async () => {
      const initialBalance = await web3.eth.getBalance(coinosisAccount);
      const instance = await Coinosis.deployed();
      await instance.receive('foo', {value: 1});
      const finalBalance = await web3.eth.getBalance(coinosisAccount);
      assert.equal(finalBalance, (BigInt(initialBalance) + 1n).toString());
    });
    it('should emit a Received event with the right arguments', async () => {
      const name = 'Hannah';
      const sender = accounts[0];
      const amount = 1;
      const instance = await Coinosis.deployed();
      const result = await instance.receive(name, {value: amount});
      truffleAssert.eventEmitted(result, 'Received', event => {
        return event.name === name
          && event.sender === sender
          && event.amount.toNumber() === amount;
      })
    });
    it('should revert with a zero-value error', async () => {
      let errorThrown = false;
      const instance = await Coinosis.deployed();
      try {
        await instance.receive('foo');
      }
      catch (err) {
        assert.include(
          err.message,
          'zero-value',
          'The error thrown isn\'t zero-value: ' + err.message
        );
        errorThrown = true;
      }
      if (!errorThrown) {
        assert.fail('No error thrown.');
      }
    });
    it('should revert with a empty-name error', async () => {
      let errorThrown = false;
      const instance = await Coinosis.deployed();
      try {
        await instance.receive('', {value: 1});
      }
      catch (err) {
        assert.include(
          err.message,
          'empty-name',
          'The error thrown isn\'t empty-name: ' + err.message
        );
        errorThrown = true;
      }
      if (!errorThrown) {
        assert.fail('No error thrown.');
      }
    });
  });

  contract('distribute()', async accounts => {
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
});
