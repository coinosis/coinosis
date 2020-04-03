const Coinosis = artifacts.require("Coinosis");

module.exports = function(deployer) {
  deployer.deploy(Coinosis);
};
