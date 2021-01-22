// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
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
  let uniswap;
  let uniswapContract;
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
  async function swapETH(token, amount, account) {

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
    await uniswap.connect(account).swapExactETHForTokens(token.address, amountOutMin, deadline, {value});

  }

  async function getTokenBalance(token, account) {

    // construct contract and get token bal
    const contract = new ethers.Contract(token.address, ERC20_ABI, account.provider);

    // get the token balance
    const balance = await contract.balanceOf(account.address);

    return balance;

  }

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {

    // Get the ContractFactory and Signers here.
    // Pool = await ethers.getContractFactory("Pool");
    poolFactory = await ethers.getContractFactory("PoolFactory");
    pool = await ethers.getContractFactory("Pool");
    uniswapContract = await ethers.getContractFactory("Swap");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    poolFactoryContract = await poolFactory.deploy();
    await poolFactoryContract.deployed();
    
    // deploy uniswap contracts
    uniswap = await uniswapContract.deploy("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    await uniswap.deployed();

    // create new pools
    await poolFactoryContract.connect(addr1).newPool(addr1.address);
    await poolFactoryContract.connect(addr2).newPool(addr2.address);

    // get all the available pools
    pools = await poolFactoryContract.getPools();

  });

  describe("Pool Factory", function() {

    this.timeout(50000);


    it("Should set pool owners", async function () {

        // there should be two pools
        expect(pools.length).to.eq(2);

        // get the first generated pool
        const pool1 = new ethers.Contract(pools[0], pool.interface, addr1.provider);

        expect(await pool1.owner()).to.equal(addr1.address);

        // create another pool owned by addr2
        poolFactoryContract.newPool(addr2.address);

        const pool2 = new ethers.Contract(pools[1], pool.interface, addr2.provider);

        expect(await pool2.owner()).to.equal(addr2.address);

    });

    it("Should swap tokens", async function() {

        const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
        const token = await Fetcher.fetchTokenData(ChainId.MAINNET, address, addr2.provider);

        let initial = await getTokenBalance(token, addr2);
        initial = parseInt(initial.toString());

        // swap ETH for token on addr2
        await swapETH(token, "5", addr2);

        let next  = await getTokenBalance(token, addr2);
        next = parseInt(next.toString());

        expect(initial).to.be.lt(next);

    });

    it("Should deposit into a pool", async function () {

        let pools = await poolFactoryContract.getPools();

        let newPool = pools[0];

        // get the last pool
        const pool1 = new ethers.Contract(newPool, pool.interface, addr2);

        const stake = 5;

        // expect(await pool1.balanceOf(addr2.address)).to.equal(0);

        // deposit 5 weth
        // await pool1.deposit('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',stake);

        const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
        const token = await Fetcher.fetchTokenData(ChainId.MAINNET, address, addr2.provider);

        /*
        const dai = new ethers.Contract(
          token.address,
          ERC20_ABI,
          addr2
        );
        */

        const nonce = await addr2.getTransactionCount();

        /*
        const transaction = {
          to: newPool,
          nonce,
          value: "5",
          // data: "0x",
          chainId: 1 // mainnet fork
        };
        */

        const transaction = {
          nonce,
          // gasLimit: config.gasLimit,
          // gasPrice: gasPrice,
          to: newPool,
          value: ethers.utils.parseEther("5"),
          // data: "0x",
          // This ensures the transaction cannot be replayed on different networks
          chainId: 1 // ropsten
        };

        // send ETH to pool
        await addr2.sendTransaction(transaction);

        expect(await pool1.balanceOf(addr2.address)).to.equal(stake);

    })





  });

  /*
  // You can nest describe calls to create subsections.
  describe("Deposit", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an assertion objet. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      // expect(await poolContract.owner()).to.equal(owner.address);
      // expect(true);
    });

  });
  */
});
