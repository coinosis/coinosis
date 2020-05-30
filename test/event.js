const Event = artifacts.require('Event');
const truffleAssert = require('truffle-assertions');

contract('Event', async accounts => {

  const id = 'comunicaciones-seguras';
  const fee = web3.utils.toWei('0.02');

  describe('contract deployment', () => {

    it('succeeds', async () => {
      const instance = await Event.new(id, fee);
      assert.ok(instance.address);
      assert.equal(id, await instance.id());
      assert.equal(fee, await instance.fee());
    });

    it('fails due to wrong number of arguments', async () => {
      await truffleAssert.fails(
        Event.new(id),
        '',
        'Invalid number of parameters for "undefined". Got 1 expected 2!'
      );
    });

    it('fails due to wrong argument types', async () => {
      await truffleAssert.fails(
        Event.new(34, fee),
        '',
        'invalid string value (arg="_id", coderType="string", value=34)'
      );
    });

  });

  describe('user registration', () => {

    it('succeeds', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      assert.equal(1, await instance.states(accounts[0]));
      assert.equal(accounts[0], await instance.attendees(0));
      assert.equal(9, await instance.allowedClaps());
    });

    it('fails due to wrong fee', async () => {
      const wrongFee = web3.utils.toWei('0.01');
      const instance = await Event.new(id, fee);
      await truffleAssert.reverts(
        instance.register({from: accounts[0], value: wrongFee}),
        'wrong-fee'
      );
    });

    it('fails due to being already registered', async () => {
      const instance = await Event.new(id, fee);
      instance.register({from: accounts[0], value: fee})
      await truffleAssert.reverts(
        instance.register({from: accounts[0], value: fee}),
        'already-registered'
      );
    });

  });

  describe('clapping', () => {

    it('succeeds', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [3, 6],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [9, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [1, 0],
        {from: accounts[2]}
      );
      const claps0 = await instance.claps(accounts[0]);
      assert.equal(10, claps0.toNumber());
      const claps1 = await instance.claps(accounts[1]);
      assert.equal(3, claps1.toNumber());
      const claps2 = await instance.claps(accounts[2]);
      assert.equal(6, claps2.toNumber());
    });

    it('fails due to not having registered', async () => {
      const instance = await Event.new(id, fee);
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [3], {from: accounts[0]}),
        'unauthorized'
      );
    });

    it('fails due to having already clapped', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.clap([accounts[1]], [3], {from: accounts[0]});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [3], {from: accounts[0]}),
        'unauthorized'
      );
    });

    it('fails due to different lengths', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [3, 2], {from: accounts[0]}),
        'different-lengths'
      );
    });

    it('silently disallows clapping for oneself', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.clap([accounts[0]], [3], {from: accounts[0]});
      const claps = await instance.claps(accounts[0]);
      assert.equal(0, claps.toNumber());
    });

    it('silently disallows clapping for unregistered attendees', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.clap([accounts[1]], [3], {from: accounts[0]});
      const claps = await instance.claps(accounts[1]);
      assert.equal(0, claps.toNumber());
    });

    it('fails due to too many claps', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1], accounts[2]], [7, 3], {from: accounts[0]}),
        'too-many-claps'
      );
    });

    it('fails due to negative claps underflow', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [-3], {from: accounts[0]}),
        'too-many-claps'
      );
    });

    // use `ganache-cli -a 100` to stress test it
    it('many attendees clapping at the same time', async () => {
      const fee = 1;
      const instance = await Event.new(id, fee);
      for (let i = 0; i < accounts.length; i++) {
        await instance.register({from: accounts[i], value: fee});
      }
      for (let i = 0; i < accounts.length; i++) {
        await instance.clap(
          accounts,
          accounts.map(a => Math.floor(Math.random() * 4)),
          {from: accounts[i]}
        );
      }
    });

  });

});
