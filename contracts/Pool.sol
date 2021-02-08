//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.7.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ILendingPool.sol";
import "./UniswapV2Interfaces.sol";


// This is the main building block for smart contracts.
contract Pool {

    // creator who can withdraw interest
    address private owner;

    // uniswap interface
    IUniswap uniswap;

    // aave lending pool interface
    ILendingPool aave;

    // mainnet dai
    // address public DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    // kovan DAI 
    address private DAI = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    // kovan aDAI
    address private aDAI = 0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8;

    // kovan USDC 
    address private USDC = 0xdCFaB8057d08634279f8201b55d311c2a67897D2;

    // kovan aUSDC
    address private aUSDC = 0xF9155b335FAa6C184aB2F2c4D5939d86268F3668;

    // mainnet usdc 
    // address private USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    // mainnet aUSDC
    // address private aUSDC = 0xBcca60bB61934080951369a648Fb03DF4F96263C;

    // kovan/mainnet uniswap router
    address private UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    // kovan aave lending pool
    address private LENDING_POOL = 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe;

    // store addres -> account mapping
    mapping(address => uint256) private balances;

    // mapping of pool owners
    mapping(address => address) private owners;

    // keep track of what the total balance of the pool is
    uint private totalBalance;



    /**
     * Contract initialization.
     *
     * The `constructor` is executed only once when the contract is created.
     * The `public` modifier makes a function callable from outside the contract.
     */
    constructor(address _owner) {

        // set owner
        owner = _owner;

        // setup uniswap interface
        uniswap = IUniswap(UNISWAP_ROUTER);

        // setup aave lending pool interface
        aave = ILendingPool(LENDING_POOL);

    }

    /**
     * Swap ETH to an ERC20 Token
     * @param _token: address of token to swap to
     * @param _to: address to send token to
     * @param _amountOutMin: minimum amount of token to receive (I think)
     * @param _deadline: deadline for transaction
     */
    function swapExactETHForTokens(
    address _token,
    address _to,
    uint _amountOutMin,
    uint _deadline)
    internal 
    {

        uint amountOutMin;

        IERC20 token = IERC20(_token);
        console.log("wallet:", msg.sender);

        // create exchange path
        address[] memory path = new address[](2);
        path[0] = uniswap.WETH();
        path[1] = address(token);

        console.log("token balance before swap:", token.balanceOf(_to));

        // if _amountOutMin is 0 calculate it with getAmountsOut()
        if (_amountOutMin == 0) {
            amountOutMin = uniswap.getAmountsOut(msg.value, path)[1];
        } else {
            amountOutMin = _amountOutMin;
        }

        // swap ETH for token
        uniswap.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            _to,
            _deadline
        );

        console.log("token balance after swap:", token.balanceOf(_to));

        // return eth to account
        // address(msg.sender).transfer(msg.value);

    }


    /**
     * Swap an ERC20 to ETH
     * @param _token:
     * @param _to: 
     * @param _amountIn:
     * @param _amountOutMin: 
     */
    function swapExactTokensForETH(
    address _token,
    address _to,
    uint _amountIn,
    uint _amountOutMin)
    internal 
    {

        uint amountOutMin;

        // setup token to be swapped
        IERC20 token = IERC20(_token);


        // transfer tokens to smart contract
        // require(token.transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');
        console.log("contract token balance before swap:", token.balanceOf(address(this)));

        // approve tokens
        require(token.approve(address(UNISWAP_ROUTER), _amountIn), "uniswap approve() failed");

        // construct path
        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = uniswap.WETH();

        // if _amountOutMin is 0 calculate it with getAmountsOut()
        if (_amountOutMin == 0) {
            amountOutMin = uniswap.getAmountsOut(_amountIn, path)[1];
        } else {
            amountOutMin = _amountOutMin;
        }

        // execute swap through uniswap and return ETH to user
        uniswap.swapExactTokensForETH(
            _amountIn,
            amountOutMin,
            path,
            _to,
            block.timestamp
        );

        console.log("contract token balance after swap:", token.balanceOf(address(this)));

    }


    /**
     * Deposit tokens into this pool.
     */
    function deposit() external payable {

        // console.log("sender: ", msg.sender);
        // console.log("value: ", msg.value);

        // TODO: swap token from _token to whichver token has highest APY on AAVE
        //Swap uniswap = Swap(UNISWAP_ROUTER);

        // setup DAI token
        IERC20 stable = IERC20(DAI);

        swapExactETHForTokens(address(stable), address(this), 0, block.timestamp);

        // at this point the contract should have converted the deposited Ether to some stablecoin

        // get the amount of available stablecoin
        uint256 amountStable = stable.balanceOf(address(this));

        console.log("stable amount before deposit: ", amountStable);

        // approve the lending pool for amountStable
        stable.approve(LENDING_POOL, amountStable);

        // deposit the stablecoins into aave's lending pool
        // the minted aTokens should come to this address
        aave.deposit(address(stable), amountStable, address(this), 0);

        // setup aToken reference
        IERC20 aToken = IERC20(aDAI);

        // amountStable = stable.balanceOf(address(this));

        console.log("stable amount after deposit: ", amountStable);

        uint aTokenBalance = aToken.balanceOf(address(this));
        console.log("aToken balance: ", aTokenBalance);

        // keep track of how much this user has deposited
        balances[msg.sender] += amountStable;

        // increment total balance
        totalBalance += amountStable;

    }



    /**
     * Withdraw tokens from this pool
     * @param amount: amount to be withdrawn from the pool
     */
    function withdraw(uint amount) public {

        // ensure balance is high enough
        require(amount <= balances[msg.sender], "Attempting to withdraw more than deposited");

        // setup stablecoin 
        IERC20 stable = IERC20(DAI);

        // setup aToken reference
        IERC20 aToken = IERC20(aDAI);

        // 
        uint aTokenAmount = aToken.balanceOf(address(this));

        require(aToken.approve(LENDING_POOL, aTokenAmount), "aToken approval failed");

        require(aToken.allowance(address(this), LENDING_POOL) > 0, "allowance too low");


        // ensure balance is high enough
        require(stable.balanceOf(address(this)) == 0, "There shouldn't be stablecoins");

        // withdraw tokens from the lending pool
        // -1 for all 
        require(aave.withdraw(address(stable), aTokenAmount, address(this)) > 0, "withdraw failed");

        // ensure balance is high enough
        require(stable.balanceOf(address(this)) > 0, "There should be stablecoins");


        // get amount of stablecoins to swapped with eth
        uint amountStable = stable.balanceOf(address(this));

        require(amountStable > 0, "no stablecoins!");

        // swap tokens back to ETH and send to user
        swapExactTokensForETH(address(stable), msg.sender, amountStable, 0);

        // ensure balance is high enough
        require(stable.balanceOf(address(this)) == 0, "There shouldn't be stablecoins again");

        // update mapping
        if (balances[msg.sender] - amountStable < 0) {
            balances[msg.sender] = 0;
        } else {
            balances[msg.sender] -= amountStable;
        }

        // update pool balance
        if (totalBalance - amountStable < 0) {
            totalBalance = 0;
        } else {
            totalBalance -= amountStable;
        }

    }

    /**
     * Withdraw the accrued interest from the pool
     */
    function creatorWithdraw() external {
        
        // ensure that the owner is the caller
        require(msg.sender == owner, "Only the owner of the pool can call this method");

        // setup aToken reference
        IERC20 aToken = IERC20(aDAI);

        // setup stablecoin 
        IERC20 stable = IERC20(DAI);

        // get the amount of aTokens currently in the contract
        uint aTokenAmount = aToken.balanceOf(address(this));

        require(aToken.approve(LENDING_POOL, aTokenAmount), "aToken approval failed");

        // withdraw tokens from the lending pool
        // -1 for all 
        require(aave.withdraw(address(stable), aTokenAmount - totalBalance, owner) > 0, "withdraw failed");

        // subtract the amount of aTokens by the total amount deposited by fans
        // balances[msg.sender] = aTokenAmount - totalBalance;

        // withdraw(amount);

        // reset amount available
        // balances[msg.sender] -= amount;

    }

    /**
     * Get the amount of stablecoin that the creator is allowed to withdraw
     */
    function getCreatorBalance() external view returns (uint) {

        IERC20 aToken = IERC20(aDAI);

        // get the amount of aTokens currently in the contract
        uint aTokenAmount = aToken.balanceOf(address(this));

        // subtract the amount of aTokens by the total amount deposited by fans
        return(aTokenAmount - totalBalance);

    }


    /**
     * Returns the total amount of ETH(?) stored in this contract 
     */
    function getTotalBalance() external view returns (uint) {
        return totalBalance;
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
