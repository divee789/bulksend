const BulkSend = artifacts.require("BulkSend");

module.exports = (deployer) => {
  deployer.deploy(BulkSend);
};
