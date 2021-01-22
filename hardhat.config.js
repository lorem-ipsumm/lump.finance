require("@nomiclabs/hardhat-waffle");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

module.exports = {
  solidity: {
    version: "0.7.0"
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      /*
      forking: {
        url: "https://mainnet.infura.io/v3/ba80b08e962a4d3b97bf1f61b5e057b2"
      }
      */
    }
  },
  /*
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
  */
};
