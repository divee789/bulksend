const DiveeToken = artifacts.require("DiveeToken");

module.exports = (deployer) => {
  deployer.deploy(DiveeToken);
};
