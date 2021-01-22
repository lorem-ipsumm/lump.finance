//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./UniswapV2Interfaces.sol";
import "hardhat/console.sol";

contract Swap {

    IUniswap uniswap;

    address public owner;

    // setup uniswap exchange address when a
    // new contract is created
    constructor(address _uniswap) public {
        // connect contract and sender
        owner = msg.sender;

        uniswap = IUniswap(_uniswap);
    }

    function triple(uint num) external pure returns(uint) {
        return (num * 3);
    }

    // 
    function swapExactTokensForTokens(
    address _inputToken,
    address _outputToken,
    uint _amountIn,
    uint _amountOutMin,
    uint _deadline,
    bool _pairExists)
    external
    payable {

        // setup tokens
        IERC20 token = IERC20(_inputToken);

        // console.log("contract: ", address(this));
        console.log("token balance before transfer:", token.balanceOf(msg.sender));

        console.log("amountIn: ", _amountIn);
        console.log("amountOutMin: ", _amountOutMin);

        // require(_amountIn >= _amountOutMin, 'Unisw!apV2Router: INSUFFICIENT_OUTPUT_AMOUNT');

        // transfer tokens to smart contract
        require(token.transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');
        console.log("token balance after transfer:", token.balanceOf(msg.sender));
        console.log("contract token balance before swap:", token.balanceOf(address(this)));

        // approve tokens
        require(token.approve(address(uniswap), _amountIn), "uniswap approve() failed");

        // setup address array
        address[] memory path;

        // if the pair exists:          path = token -> token
        // if the pair doesn't exist:   path = token -> eth -> token 
        if (_pairExists) {

            // construct path
            path = new address[](2);
            path[0] = address(token);
            path[1] = _outputToken;

        } else {

            // construct path
            path = new address[](3);
            path[0] = address(token);
            path[1] = uniswap.WETH();
            path[2] = _outputToken;


        }

        // execute swap through uniswap
        uniswap.swapExactTokensForTokens(
            _amountIn,
            _amountOutMin,
            path,
            msg.sender,
            _deadline
        );

        console.log("contract token balance after swap:", token.balanceOf(address(this)));

    }
    


    // swap ETH -> Tokens
    function swapExactETHForTokens(
    address _token,
    uint _amountOutMin,
    uint _deadline)
    external
    payable {

        // console.log("value:", msg.value);
        console.log("sender:", msg.sender);

        IERC20 token = IERC20(_token);
        // console.log("wallet balance:", msg.sender.balance);

        // create exchange path
        address[] memory path = new address[](2);
        path[0] = uniswap.WETH();
        path[1] = address(token);

        console.log("token balance before buy:", token.balanceOf(msg.sender));

        // execute swap
        uniswap.swapExactETHForTokens{value: msg.value}(
            _amountOutMin,
            path,
            msg.sender,
            _deadline
        );

        // console.log("new wallet balance:", msg.sender.balance);
        console.log("token balance after buy:", token.balanceOf(msg.sender));

        // return eth to account
        // address(msg.sender).transfer(msg.value);

    }

    // swap Tokens -> ETH
    function swapExactTokensForETH(
    address _token,
    uint _amountIn,
    uint _amountOutMin,
    uint _deadline)
    external
    {

        IERC20 token = IERC20(_token);
        console.log("sender: ", msg.sender);

        // approval is called outside of contract
        // token.approve(address(msg.sender), _amountIn);

        // console.log("contract: ", address(this));
        console.log("token balance before transfer:", token.balanceOf(msg.sender));

        console.log("amountIn: ", _amountIn);
        console.log("amountOutMin: ", _amountOutMin);

        // require(_amountIn >= _amountOutMin, 'Unisw!apV2Router: INSUFFICIENT_OUTPUT_AMOUNT');

        // transfer tokens to smart contract
        require(token.transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');
        console.log("token balance after transfer:", token.balanceOf(msg.sender));
        console.log("contract token balance before swap:", token.balanceOf(address(this)));

        // approve tokens
        require(token.approve(address(uniswap), _amountIn), "uniswap approve() failed");

        // construct path
        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = uniswap.WETH();

        // execute swap through uniswap
        uniswap.swapExactTokensForETH(
            _amountIn,
            _amountOutMin,
            path,
            msg.sender,
            _deadline
        );

        console.log("contract token balance after swap:", token.balanceOf(address(this)));

    }

}