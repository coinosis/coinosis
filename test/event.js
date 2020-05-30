const Event = artifacts.require('Event');
const truffleAssert = require('truffle-assertions');

contract('Event', async accounts => {

  const id = 'comunicaciones-seguras';
  const fee = web3.utils.toWei('0.02');

  describe('contract deployment', () => {

    it('succeeds', async () => {
      const instance = await Event.new(id, fee);
      assert.ok(instance.address);
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
      assert.equal(1, await instance.states(accounts[0]));
      assert.equal(accounts[0], await instance.attendees(0));
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
      await instance.clap([accounts[1]], [5], {from: accounts[0]});
      const claps = await instance.claps(accounts[1]);
      assert.equal(5, claps.toNumber());
    });

    it('fails due to not having registered', async () => {

    });

  });

});
