const Event = artifacts.require('Event');
const truffleAssert = require('truffle-assertions');

contract('Event', accounts => {

  const fee = web3.utils.toWei('0.02');
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  const end = Math.floor(endDate.getTime() / 1000);

  describe('deployment', () => {

    it('succeeds', async () => {
      const instance = await Event.new(fee, end);
      assert.ok(instance.address);
      assert.equal(fee, await instance.fee());
      assert.equal(end, await instance.end());
      assert.equal('2.2.4', web3.utils.hexToUtf8(await instance.version()));
    });

    it('fails due to wrong number of arguments', async () => {
      await truffleAssert.fails(
        Event.new(fee),
        '',
        'Invalid number of parameters for "undefined". Got 1 expected 2!'
      );
    });

    it('fails due to wrong argument types', async () => {
      await truffleAssert.fails(
        Event.new('hey', end),
        '',
        'invalid number value (arg="_fee", coderType="uint128", value="hey")'
      );
    });

    it('fails due to an end date in the past', async () => {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() - 1);
      const end = Math.floor(endDate.getTime() / 1000);
      await truffleAssert.reverts(Event.new(fee, end));
    });

  });

  describe('getting the attendees', () => {

    it('succeeds', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      const attendees = await instance.getAttendees();
      assert.equal(3, attendees.length);
    });

  });

  describe('registering', () => {

    it('succeeds', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      assert.equal(1, await instance.states(accounts[0]));
      assert.equal(3, (await instance.getAttendees()).length);
    });

    it('fails due to wrong fee', async () => {
      const wrongFee = web3.utils.toWei('0.01');
      const instance = await Event.new(fee, end);
      await truffleAssert.reverts(
        instance.register({from: accounts[0], value: wrongFee})
      );
    });

    it('fails due to being already registered', async () => {
      const instance = await Event.new(fee, end);
      instance.register({from: accounts[0], value: fee})
      await truffleAssert.reverts(
        instance.register({from: accounts[0], value: fee})
      );
    });

    it('fails due to registering after the event finished', async () => {
      const endDate = new Date();
      let end = Math.floor(endDate.getTime() / 1000);
      end += 2;
      const instance = await Event.new(fee, end);
      await new Promise(resolve => setTimeout(resolve, 2001));
      await truffleAssert.reverts(
        instance.register({from: accounts[0], value: fee})
      );
    });

  });

  describe('clapping', () => {

    it('succeeds', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [40, 60],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [100, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [30, 0],
        {from: accounts[2]}
      );
      const claps0 = await instance.claps(accounts[0]);
      assert.equal(131, claps0.toNumber());
      const claps1 = await instance.claps(accounts[1]);
      assert.equal(41, claps1.toNumber());
      const claps2 = await instance.claps(accounts[2]);
      assert.equal(61, claps2.toNumber());
      const totalClaps = await instance.totalClaps();
      assert.equal(233, totalClaps.toNumber());
      const state0 = await instance.states(accounts[0]);
      assert.equal(2, state0.toNumber());
      const state1 = await instance.states(accounts[1]);
      assert.equal(2, state1.toNumber());
      const state2 = await instance.states(accounts[2]);
      assert.equal(2, state2.toNumber());
    });

    it('fails due to not having registered', async () => {
      const instance = await Event.new(fee, end);
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [100], {from: accounts[0]})
      );
    });

    it('fails due to having already clapped', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.clap([accounts[1]], [100], {from: accounts[0]});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [100], {from: accounts[0]})
      );
    });

    it('fails due to different lengths', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [60, 30], {from: accounts[0]})
      );
    });

    it('silently disallows clapping for oneself', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.clap([accounts[0]], [100], {from: accounts[0]});
      const claps = await instance.claps(accounts[0]);
      assert.equal(1, claps.toNumber());
    });

    it('silently disallows clapping for unregistered attendees', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.clap([accounts[1]], [100], {from: accounts[0]});
      const claps = await instance.claps(accounts[1]);
      assert.equal(0, claps.toNumber());
    });

    it('fails due to too many claps', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1], accounts[2]], [70, 40], {from: accounts[0]})
      );
    });

    it('fails due to negative claps underflow', async () => {
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await truffleAssert.reverts(
        instance.clap([accounts[1]], [-60], {from: accounts[0]})
      );
    });

    // use `ganache-cli -a 100` to stress test it
    it('many attendees clapping at the same time', async () => {
      const fee = 1;
      const instance = await Event.new(fee, end);
      for (let i = 0; i < accounts.length; i++) {
        await instance.register({from: accounts[i], value: fee});
      }
      for (let i = 0; i < accounts.length; i++) {
        await instance.clap(
          accounts,
          accounts.map(a => Math.floor(Math.random() * 100 / accounts.length)),
          {from: accounts[i]}
        );
      }
    });

  });

  describe('distributing', () => {

    it('emits Distribution & Transfer events', async () => {
      const endDate = new Date();
      let end = Math.floor(endDate.getTime() / 1000);
      end += 2;
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [40, 60],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [100, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [30, 0],
        {from: accounts[2]}
      );
      const claps = [131, 41, 61];
      const totalReward = 3 * fee;
      const totalClaps = 233;
      await new Promise(resolve => setTimeout(resolve, 2001));
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
      const endDate = new Date();
      let end = Math.floor(endDate.getTime() / 1000);
      end += 2;
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [40, 60],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [100, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [30, 0],
        {from: accounts[2]}
      );
      const claps = [131, 41, 61];
      const totalReward = 3 * fee;
      const totalClaps = 233;
      const preBalances = [];
      for (let i = 0; i < claps.length; i++) {
        const balance = await web3.eth.getBalance(accounts[i]);
        preBalances.push(balance);
      }
      await new Promise(resolve => setTimeout(resolve, 2001));
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

    it('doesn\'t reward twice', async () => {
      const endDate = new Date();
      let end = Math.floor(endDate.getTime() / 1000);
      end += 2;
      const instance = await Event.new(fee, end);
      await instance.register({from: accounts[0], value: fee});
      await instance.register({from: accounts[1], value: fee});
      await instance.register({from: accounts[2], value: fee});
      await instance.clap(
        [accounts[1], accounts[2]],
        [40, 60],
        {from: accounts[0]}
      );
      await instance.clap(
        [accounts[0], accounts[2]],
        [100, 0],
        {from: accounts[1]}
      );
      await instance.clap(
        [accounts[0], accounts[1]],
        [30, 0],
        {from: accounts[2]}
      );
      await new Promise(resolve => setTimeout(resolve, 2001));
      await instance.distribute();
      await truffleAssert.reverts(instance.distribute({from: accounts[1]}));
    });

    it(
      'fails due to attempting to distribute before the event finished',
      async () => {
        const instance = await Event.new(fee, end);
        await instance.register({from: accounts[0], value: fee});
        await instance.register({from: accounts[1], value: fee});
        await instance.register({from: accounts[2], value: fee});
        await instance.clap(
          [accounts[1], accounts[2]],
          [40, 60],
          {from: accounts[0]}
        );
        await instance.clap(
          [accounts[0], accounts[2]],
          [100, 0],
          {from: accounts[1]}
        );
        await instance.clap(
          [accounts[0], accounts[1]],
          [30, 0],
          {from: accounts[2]}
        );
        await truffleAssert.reverts(instance.distribute({from: accounts[2]}));
      });

    it(
      'the contract doesn\'t retain any amount after self-clapping',
      async () => {
        const endDate = new Date();
        let end = Math.floor(endDate.getTime() / 1000);
        end += 2;
        const instance = await Event.new(fee, end);
        await instance.register({ from: accounts[0], value: fee, });
        await instance.clap([ accounts[0] ], [ 100 ], { from: accounts[0], });
        await new Promise(resolve => setTimeout(resolve, 2001));
        const balancePre = BigInt(await web3.eth.getBalance(accounts[0]));
        await instance.distribute({ from: accounts[1], });
        const balancePost = BigInt(await web3.eth.getBalance(accounts[0]));
        assert.equal(await web3.eth.getBalance(instance.address), 0);
        assert.equal(String(balancePost), String(balancePre + BigInt(fee)));
      });

  });

});
