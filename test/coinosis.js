const Coinosis = artifacts.require('Coinosis');
const truffleAssert = require('truffle-assertions');

contract.skip('Coinosis', async accounts => {

  const getBalances = async accounts => {
    const balances = [];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await web3.eth.getBalance(account);
      balances.push(BigInt(balance));
    }
    return balances;
  }

  const areEqual = (arrayA, arrayB) => {
    if (arrayA.length !== arrayB.length) return false;
    for (let i = 0; i < arrayA.length; i++) {
      if (arrayA[i] != arrayB[i]) return false;
    }
    return true;
  }

  const checkIncrements = (arrayA, arrayB, increments) => {
    for (let i = 0; i < arrayA.length; i++) {
      assert.equal(
        arrayB[i].toString(),
        (arrayA[i] + BigInt(increments[i])).toString()
      );
    }
  }

  const eventURL = 'reencuentro-helvetia-2020';
  const registrationFeeUSDWei = web3.utils.toWei('5');
  const ETHPriceUSDWei = web3.utils.toWei('187.79');
  const names = [
    'Alejandra Arias',
    'Valentina Jaramillo',
    'Laura Acosta',
    'María de Sagarminaga',
    'Camila Ríos',
    'Daniela Rodríguez',
    'Cristina Pabón',
    'Gabriela Dávila',
    'Valentina Figueroa',
  ];
  const addresses = accounts.slice(1);
  const claps = [8, 10, 4, 7, 3, 6, 4, 7, 4];

  const registrationFeeWei = 26625485915117950n;
  const totalFeesWei = 239629373236061550n;
  const totalClaps = 53;
  const rewards = [
    36170471431858347n,
    45213089289822933n,
    18085235715929173n,
    31649162502876053n,
    13563926786946880n,
    27127853573893760n,
    18085235715929173n,
    31649162502876053n,
    18085235715929173n
  ];
  const rewardedAmount = 239629373236061545n;

  it('should send rewards according to claps', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const initialBalances = await getBalances(addresses);
    await instance.assess(
      eventURL,
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      claps
    );
    const finalBalances = await getBalances(addresses);
    checkIncrements(initialBalances, finalBalances, rewards);
  });

  it('should emit a Assessment event', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const result = await instance.assess(
      eventURL,
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      claps
    );
    const currentTime = new Date().getTime() / 1000;
    truffleAssert.eventEmitted(result, 'Assessment', event => {
      return event.timestamp <= currentTime &&
        event.timestamp > currentTime - 10 &&
        event.eventURL == web3.utils.sha3(eventURL) &&
        event.registrationFeeUSDWei == registrationFeeUSDWei &&
        event.ETHPriceUSDWei == ETHPriceUSDWei &&
        areEqual(event.names, names) &&
        areEqual(event.addresses, addresses) &&
        areEqual(event.claps, claps) &&
        event.registrationFeeWei == registrationFeeWei &&
        event.totalFeesWei == totalFeesWei &&
        event.totalClaps == totalClaps &&
        areEqual(event.rewards, rewards);
    });
  });

  it('should emit nine Transfer events with the right values', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const result = await instance.assess(
      eventURL,
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      claps
    );
    let eventsEmitted = 0
    truffleAssert.eventEmitted(result, 'Transfer', (event, i) => {
      eventsEmitted++;
      return event.name == names[i] &&
        event.addr == addresses[i] &&
        event.registrationFeeUSDWei == registrationFeeUSDWei &&
        event.registrationFeeWei == registrationFeeWei &&
        event.claps == claps[i] &&
        event.reward == rewards[i]
    });
    assert.equal(eventsEmitted, addresses.length)
  });

  it('should emit a RewardedAmount event', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const result = await instance.assess(
      eventURL,
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      claps
    );
    const expected = totalFeesWei;
    truffleAssert.eventEmitted(result, 'RewardedAmount', event => {
      return BigInt(event.rewardedAmount) === rewardedAmount;
    });
  });

  it('should revert with a \'not-owner\' error', async () => {
    const instance = await Coinosis.new({from: accounts[1]});
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        addresses,
        claps
      ),
      'not-owner'
    );
  });

  it('should revert with a \'insufficient-value\' error', async () => {
    const instance = await Coinosis.new();
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        addresses,
        claps
      ),
      'insufficient-value'
    );
  });

  it('should emit only two Transfer events', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const newClaps = [0, 0, 0, 0, 0, 0, 0, 5, 10];
    const result = await instance.assess(
      eventURL,
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      newClaps,
    );
    const newRewards = [
      79876457745353850n,
      159752915490707700n
    ];
    let eventsEmitted = 0
    truffleAssert.eventEmitted(result, 'Transfer', (event, i) => {
      eventsEmitted++;
      return event.name == names[7 + i] &&
        event.addr == addresses[7 + i] &&
        event.registrationFeeUSDWei == registrationFeeUSDWei &&
        event.registrationFeeWei == registrationFeeWei &&
        event.claps == newClaps[7 + i] &&
        event.reward == newRewards[i];
    });
    assert.equal(eventsEmitted, 2)
  });

  it('should revert with a \'names-differ-addresses\' error', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const newAddresses = [ ...addresses ];
    newAddresses.push(accounts[0]);
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        newAddresses,
        claps
      ),
      'names-differ-addresses'
    )
  });

  it('should revert with a \'addresses-differ-claps\' error', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const newClaps = [ ...claps ];
    newClaps.push(8);
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        addresses,
        newClaps
      ),
      'addresses-differ-claps'
    );
  });

  it('should revert with a \'invalid-eth-price\' error', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        0,
        names,
        addresses,
        claps
      ),
      'invalid-eth-price'
    );
  });

  it('zero registration fee: should not fail nor emit transfer events',
     async () => {
       const instance = await Coinosis.new();
       await web3.eth.sendTransaction({
         from: accounts[0],
         to: instance.address,
         value: web3.utils.toWei('1')
       });
       const result = await instance.assess(
         eventURL,
         0,
         ETHPriceUSDWei,
         names,
         addresses,
         claps
       );
       truffleAssert.eventNotEmitted(result, 'Transfer');
     });

  it('should revert with a \'no-claps\' error', async () => {
    const instance = await Coinosis.new();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: instance.address,
      value: web3.utils.toWei('1')
    });
    const newClaps = claps.map(clap => 0);
    truffleAssert.reverts(
      instance.assess(
        eventURL,
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        addresses,
        newClaps
      ),
      'no-claps'
    );
  });

  it('decommission: send all remaining funds to owner',
     async () => {
       const value = web3.utils.toWei('1');
       const instance = await Coinosis.new();
       await web3.eth.sendTransaction({
         from: accounts[0],
         to: instance.address,
         value,
       });
       await instance.assess(
         eventURL,
         registrationFeeUSDWei,
         ETHPriceUSDWei,
         names,
         addresses,
         claps
       );
       const initialBalance = await web3.eth.getBalance(accounts[0]);
       const gasPrice = web3.utils.toWei('10', 'gwei');
       const result = await instance.decommission({ gasPrice });
       const txFee = result.receipt.gasUsed * gasPrice;
       const finalBalance = await web3.eth.getBalance(accounts[0]);
       const actualBalance = BigInt(finalBalance) - BigInt(initialBalance)
         + BigInt(txFee);
       const expectedBalance = BigInt(value) - rewardedAmount;
       assert.equal(actualBalance, expectedBalance);
       assert.equal(expectedBalance, actualBalance);
       const contractBalance = await web3.eth.getBalance(instance.address);
       assert.equal(contractBalance, '0');
       const decommissionProof = await instance.assess('', 0, 0, [], [], []);
       assert.equal(decommissionProof.logs.length, 0);
     });

  it('decommission: only the owner can do it',
     async () => {
       const value = web3.utils.toWei('1');
       const instance = await Coinosis.new({from: accounts[1]});
       await web3.eth.sendTransaction({
         from: accounts[0],
         to: instance.address,
         value,
       });
       await instance.assess(
         eventURL,
         registrationFeeUSDWei,
         ETHPriceUSDWei,
         names,
         addresses,
         claps,
         {from: accounts[1]}
       );
       truffleAssert.reverts(instance.decommission(), 'not-owner');
     });

  it('version: should show the version number', async () => {
    const instance = await Coinosis.new();
    const version = await instance.version();
    assert.ok(version.length >= 5);
  });

});
