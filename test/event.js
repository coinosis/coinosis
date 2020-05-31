const Event = artifacts.require('Event');
const truffleAssert = require('truffle-assertions');

contract('Event', accounts => {

  const id = 'comunicaciones-seguras';
  const fee = web3.utils.toWei('0.02');

  describe('deployment', () => {

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

  describe('registering', () => {

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
      const totalClaps = await instance.totalClaps();
      assert.equal(19, totalClaps.toNumber());
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

  describe('distributing', () => {

    it('emits Distribution & Transfer events', async () => {
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
      const claps = [10, 3, 6];
      const totalReward = 3 * fee;
      const totalClaps = 19;
      const result = await instance.distribute({from: accounts[2]});
      truffleAssert.eventEmitted(result, 'Distribution', event => {
        return event.totalReward == totalReward;
      });
      let transferCount = 0;
      truffleAssert.eventEmitted(result, 'Transfer', (event, i) => {
        transferCount ++;
        const expectedReward = claps[i] * totalReward / totalClaps;
        const expectedRewardETH = Number(
          web3.utils.fromWei(String(expectedReward))
        ).toFixed(16);
        const actualReward = event.reward;
        const actualRewardETH = Number(
          web3.utils.fromWei(actualReward.toString())
        ).toFixed(16);
        return event.attendee == accounts[i]
          && expectedRewardETH == actualRewardETH;
      });
      assert.equal(3, transferCount);

    });

    it('actual transfers are made', async () => {
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
      const claps = [10, 3, 6];
      const totalReward = 3 * fee;
      const totalClaps = 19;
      const preBalances = [];
      for (let i = 0; i < claps.length; i++) {
        const balance = await web3.eth.getBalance(accounts[i]);
        preBalances.push(balance);
      }
      await instance.distribute({from: accounts[3]});
      for (let i = 0; i < claps.length; i++) {
        const expectedReward = claps[i] * totalReward / totalClaps;
        const expectedRewardETH = Number(
          web3.utils.fromWei(String(expectedReward))
        ).toFixed(12);
        const balance = await web3.eth.getBalance(accounts[i]);
        const actualReward = balance - preBalances[i];
        const actualRewardETH = Number(
          web3.utils.fromWei(String(actualReward))
        ).toFixed(12);
        assert.equal(expectedRewardETH, actualRewardETH);
      }
      const finalBalance = await web3.eth.getBalance(instance.address);
      assert.ok(finalBalance < 3);
    });

    it('fails due to no claps', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [0, 0],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [0, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [0, 0],
        {from: accounts[2]}
      );
      await truffleAssert.reverts(
        instance.distribute(),
        'no-claps'
      );
    });

    it('doesn\'t reward twice', async () => {
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
      await instance.distribute();
      const preBalance = await web3.eth.getBalance(accounts[0]);
      await instance.distribute({from: accounts[1]});
      const postBalance = await web3.eth.getBalance(accounts[0]);
      assert.equal(preBalance, postBalance);
    });

    it('doesn\'t reward a user without claps', async () => {
      const instance = await Event.new(id, fee);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [3, 0],
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
      const preBalance = await web3.eth.getBalance(accounts[2]);
      await instance.distribute();
      const postBalance = await web3.eth.getBalance(accounts[2]);
      assert.equal(preBalance, postBalance);
    });

  });

});
