//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * This contract handles the creations of new pools
 */
contract PoolFactory {

    // list of pools that have been created
    Pool[] private pools;

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
    constructor() {
        // The totalSupply is assigned to transaction sender, which is the account
        // that is deploying the contract.
        owner = msg.sender;
    }

    /**
     * Read only function to retrieve all pools that have been created
     */
    function getPools() public view returns (Pool[] memory){
        return pools;
    }

    /**
     * A function to create new Pool contracts for creators
     *
     * @param _owner: the owner of the pool which determines which wallet can withdraw pooled 
     * interest.
     * @return address of newly created pool
     */
    function newPool(address _owner) external returns(address){

        // initialize new pool
        Pool pool = new Pool(_owner);

        // push new pool to pool list
        pools.push(pool);

        // get newly created pool
        address poolAddr = address(pools[pools.length - 1]);

        return poolAddr;

    }



}
