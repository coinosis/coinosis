const Coinosis = artifacts.require('Coinosis');

module.exports = async callback => {
  const instance = await Coinosis.deployed();
  const result = await instance.decommission();
  console.log(result);
  callback();
}
