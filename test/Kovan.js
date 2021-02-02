// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect, use } = require("chai");
const { formatEther } = require("ethers/lib/utils");
const { ChainId, Fetcher, Token, Route, Trade, TokenAmount, TradeType, Percent, WETH } = require("@uniswap/sdk");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Pools", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let pool;
  let poolFactory;
  let poolContract;
  let poolFactoryContract;
  let pools;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  const weth = WETH[ChainId.MAINNET];

  const ERC20_ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (boolean)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  // swap ETH to Token
  async function swapETH(contract, token, amount, account) {

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    // const token = await Fetcher.fetchTokenData(ChainId.MAINNET, token.address, account.provider);
    // console.log(token);

    // get pair data
    const pair = await Fetcher.fetchPairData(token, weth, account);

    // get route
    const route = new Route([pair], weth);

    // get trade for execution price
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther(amount).toString()), TradeType.EXACT_INPUT);
    const value = trade.inputAmount.raw.toString();

    // smart contract parameters 
    const slippageTolerance = new Percent('5', '100');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString();

    // perform action on behalf of account
    await contract.connect(account).swapExactETHForTokens(token.address, account.address, amountOutMin, deadline, {value});

  }

  // get an accounts balance of token
  async function getTokenBalance(token, account) {

    // construct contract and get token bal
    const contract = new ethers.Contract(token.address, ERC20_ABI, account.provider);

    // get the token balance
    const balance = await contract.balanceOf(account.address);

    return balance;

  }

  // get account ether balance
  async function getWalletBalance(account) {

    let walletBalance = await account.provider.getBalance(account.address);
    return parseFloat(ethers.utils.formatEther(walletBalance.toString()));

  }

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {

    // Get the ContractFactory and Signers here.
    // Pool = await ethers.getContractFactory("Pool");
    poolFactory = await ethers.getContractFactory("PoolFactory");
    pool = await ethers.getContractFactory("Pool");
    // uniswapContract = await ethers.getContractFactory("Swap");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // get account balance
    // console.log("Account balance:", (await owner.getBalance()).toString());


    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    // poolFactoryContract = await poolFactory.deploy();
    poolFactoryContract = new ethers.Contract(
      "0xfd0b6580bFc9DD1d45E21aDab7c651449B82D54B", 
      poolFactory.interface, 
      owner.provider
    );
    // await poolFactoryContract.deployed();

    // deploy uniswap contracts
    // uniswap = await uniswapContract.deploy("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    // await uniswap.deployed();

    // create new pools
    // await poolFactoryContract.connect(addr1).newPool(addr1.address);
    // await poolFactoryContract.connect(addr2).newPool(addr2.address);

    // get all the available pools
    pools = await poolFactoryContract.connect(owner).getPools();

  });

  describe("Kovan Test", function () {

    this.timeout(50000);

    it("Should get my deposited balance", async function() {

      return;


      let targetPool = pools[0];

      // get the last pool
      const pool1 = new ethers.Contract(targetPool, pool.interface, owner);

      let userBalance = await pool1.balanceOf(owner.address);

      console.log(ethers.utils.formatEther(userBalance.toString()));

      // let bal = await pool1.connect(owner).getTotalBalance();

      expect(userBalance).to.be.gt(0);


    });

    it("Should withdraw from Kovan pool", async function() {

      let targetPool = pools[0];

      // get the last pool
      const pool1 = new ethers.Contract(targetPool, pool.interface, owner);

      // get balance
      let userBalance = await pool1.balanceOf(owner.address);
      let amount = "11802015251953149519669";


      // withdraw balance
      await pool1.withdraw(amount, {gasLimit:8000000, gasPrice:1000000000});

      userBalance = await pool1.balanceOf(owner.address);

      expect(userBalance).to.be.eq(0);


    });

    it("Should deposit to Kovan pool", async function() {

      return;


      // get pool
      let targetPool = pools[0];

      // get the last pool
      const pool1 = new ethers.Contract(targetPool, pool.interface, owner);

      const stake = 0.03;

      // expect(await pool1.balanceOf(addr2.address)).to.equal(0);

      // deposit 5 weth
      // await pool1.deposit('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',stake);

      // const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
      // const token = await Fetcher.fetchTokenData(ChainId.MAINNET, address, addr2.provider);

      let bal = await pool1.connect(owner).getTotalBalance();
      // console.log(bal.toString());

      let value = ethers.utils.parseEther(stake.toString());

      await pool1.connect(owner).deposit({value: value, gasLimit:8000000, gasPrice:1000000000});
      // await pool1.connect(owner).withdraw({value: "5000000000000000000"});

      let userBalance = await pool1.balanceOf(owner.address);
      userBalance = parseFloat(userBalance.toString());

      expect(userBalance).to.be.gt(0);

      // let walletBal1 = await getWalletBalance(owner);

      // await pool1.withdraw(userBalance);

      // deposit on behalf of another account


    })

  });

});
