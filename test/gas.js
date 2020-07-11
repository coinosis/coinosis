const Event = artifacts.require('Event');

contract ('gas usage', accounts => {

  describe(`${accounts.length} attendees`, () => {

    it('', async () => {
      const fee = web3.utils.toWei('0.02');
      const now = new Date();
      const timestamp = Math.floor(now.getTime() / 1000);
      const end = timestamp + Math.floor(accounts.length * 0.1);
      const instance = await Event.new(fee, end);
      console.log('register');
      for (let i = 0; i < accounts.length; i++) {
        const result = await instance.register({ from: accounts[i], value: fee });
        console.log(result.receipt.gasUsed.toLocaleString());
      }
      const claps = [
        3,1,2,2,0,15,7,3,2,1,1,2,2,1,10,1,3,2,1,1,2,2,1,1,1,3,2,1,1,2,2,1,1,1,3,
        2,1,1,2,2,1,1,1,3,2,1,1,2,2,1,1,1,3,2,1,1,2,2,1,1,1,3,2,1,1,2,2,1,1,1,3,
        2,1,1,2,2,1,1,1,3,2,1,1,2,2,1,1,1,3,2,1,3,2,3,1,3,1,0,1,2,1,3,2,2,1,2,3,
      ].slice(0, accounts.length);
      console.log('clap');
      for (let i = 0; i < accounts.length; i++) {
        const result = await instance.clap(
          accounts,
          claps,
          { from: accounts[i] }
        );
        console.log(result.receipt.gasUsed.toLocaleString());
      }
      console.log('distribute');
      const result = await instance.distribute();
      console.log(result.receipt.gasUsed.toLocaleString());
    });

  });

});
