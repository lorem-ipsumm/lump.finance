require("@nomiclabs/hardhat-waffle");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require('dotenv').config();

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
    }, 
    mainnet: {
      chainId: 137,
      url: 'https://polygon-rpc.com/',
      accounts: [process.env.PRIVATE_KEY]
    },
    kovan: {
      url: "https://kovan.infura.io/v3/73c8268a1cb9451182cf1e7319f1cc8f",
      accounts: [process.env.KOVAN_PRIVATE_KEY],
      chainId: 42
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
