const Coinosis = artifacts.require("Coinosis");
const CoinosisV0 = artifacts.require("CoinosisV0");

module.exports = function(deployer) {
  deployer.deploy(Coinosis);
  deployer.deploy(CoinosisV0);
};
