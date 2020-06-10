const ProxyEvent = artifacts.require('ProxyEvent');
const truffleAssert = require('truffle-assertions');

contract('ProxyEvent', accounts => {

  const fee = web3.utils.toWei('0.02');
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000)
  const end = timestamp + 100;

  describe('registering for', () => {

    it('succeeds', async () => {
      const instance = await ProxyEvent.new(fee, end);
      await instance.registerFor(accounts[0], {from: accounts[9], value: fee});
      await instance.registerFor(accounts[1], {from: accounts[8], value: fee});
      await instance.registerFor(accounts[2], {from: accounts[7], value: fee});
      assert.equal(accounts[9], await instance.proxy(accounts[0]));
      assert.equal(accounts[8], await instance.proxy(accounts[1]));
      assert.equal(accounts[7], await instance.proxy(accounts[2]));
    });

  });

  describe('clapping for', () => {

    it('succeeds', async () => {
      const instance = await ProxyEvent.new(fee, end);
      await instance.registerFor(accounts[0], {from: accounts[9], value: fee});
      await instance.registerFor(accounts[1], {from: accounts[8], value: fee});
      await instance.registerFor(accounts[2], {from: accounts[7], value: fee});
      await instance.clapFor(
        accounts[0],
        [accounts[1], accounts[2]],
        [3, 6],
        {from: accounts[9]}
      );
      await instance.clapFor(
        accounts[1],
        [accounts[0], accounts[2]],
        [9, 0],
        {from: accounts[8]}
      );
      await instance.clapFor(
        accounts[2],
        [accounts[0], accounts[1]],
        [1, 0],
        {from: accounts[7]}
      );
    });

    it('fails due to not having registered with a proxy', async () => {
      const instance = await ProxyEvent.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await truffleAssert.reverts(
        instance.clapFor(accounts[0], [accounts[1]], [3], {from: accounts[9]})
      );
    });

    it('fails due to having registered with a different proxy', async () => {
      const instance = await ProxyEvent.new(fee, end);
      await instance.registerFor(accounts[0], {from: accounts[9], value: fee});
      await instance.registerFor(accounts[1], {from: accounts[8], value: fee});
      await truffleAssert.reverts(
        instance.clapFor(accounts[0], [accounts[1]], [3], {from: accounts[8]})
      );
    });
  });
});
