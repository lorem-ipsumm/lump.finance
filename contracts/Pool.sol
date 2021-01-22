//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.7.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// This is the main building block for smart contracts.
contract Pool {

    // creator who can withdraw interest
    address public owner;

    // A mapping is a key/value map. Here we store each account balance.
    mapping(address => uint256) balances;

    /**
     * Contract initialization.
     *
     * The `constructor` is executed only once when the contract is created.
     * The `public` modifier makes a function callable from outside the contract.
     */
    constructor(address _owner) {
        // set owner
        owner = _owner;
    }

    /**
     * Listen for ETH payments to contract
     */
    fallback() external payable {
        // custom function code
        console.log("fallback received eth");
    }

    receive() external payable {

        // call deposit on eth
        deposit(0x0000000000000000000000000000000000000000, msg.value);

    }


    /**
     * Deposit tokens into this pool.
     * @param _token: the token being deposited
     * @param _amount: the amount of _token being deposited
     */
    function deposit(address _token, uint _amount) internal {

        console.log("sender: ", msg.sender);
        console.log("amount: ", _amount);

        // TODO: swap token from _token to whichver token has highest APY on AAVE

        // keep track of how much this user has deposited
        balances[msg.sender] += _amount;

    }


    /**
     * Withdraw tokens from this pool
     */
    function withdraw() external {

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
