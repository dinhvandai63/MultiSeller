
var Seller = artifacts.require('Seller');

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  //send value 0.3 ether to contract seller
  deployer.deploy(Seller,{ value: 300000000000000000 });
};