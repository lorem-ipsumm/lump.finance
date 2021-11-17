// This is a script for deploying your contracts. You can adapt it to deploy

const { ethers, artifacts } = require("hardhat");
let addresses = {};

// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  // console.log("Account balance:", (await deployer.getBalance()).toString());

  let bal1 = await deployer.getBalance();
  bal1 = ethers.utils.formatEther(bal1.toString());

  // const Token = await ethers.getContractFactory("Token");
  // const token = await Token.deploy();
  // await token.deployed();

  // deploy PoolFactory.sol
  const PoolFactory = await ethers.getContractFactory("PoolFactory");
  const poolFactory = await PoolFactory.deploy();
  await poolFactory.deployed();

  const Pool = await ethers.getContractFactory("Pool");
  const pool = await Pool.deploy(deployer.address);
  await pool.deployed();

  let bal2 = await deployer.getBalance();
  bal2 = ethers.utils.formatEther(bal2.toString());

  const cost = parseFloat(bal1) - parseFloat(bal2);

  // console.log("Contract address:", poolFactory.address);
  console.log(`Cost: ${cost} ${ethers.constants.EtherSymbol}`);

  // We also save the contract's artifacts and address in the frontend directory
  // saveFrontendFiles(pool, "Pool");
  // saveFrontendFiles(poolFactory, "PoolFactory");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // add contract name: address pair
  addresses[name] = contract.address;

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(addresses, undefined, 2)
  );

  // const PoolArtifact = artifacts.readArtifactSync("Pool");
  // const PoolFactoryArtifact = artifacts.readArtifactSync("PoolFactory");
  const artifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(artifact, null, 2)
  );
 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
