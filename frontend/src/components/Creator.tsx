import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
import useInterval from './UseInterval'
import Loading from './Loading';
import "../css/creator.css";
import { ethers } from "ethers";
import PoolAritfact from "../contracts/Pool.json";
import axios from 'axios';
// import contractAddress from "../contracts/contract-address.json";


/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
function Creator(props: {poolFactory: ethers.Contract, 
                         provider: ethers.providers.Web3Provider,
                         connectedAddress: string}) {


    // const[creatorLoaded, setCreatorLoaded] = useState(false);
    const[walletBalance, setWalletBalance] = useState<number>(0);
    const[inputAmount, setInputAmount] = useState<number>(0);
    const[depositBalance, setDepositBalance] = useState<number>(0);
    const[poolContract, setPoolContract] = useState<ethers.Contract>();
    const[poolBalance, setPoolBalance] = useState<number>(0);

    async function initialize() {

        getCreatorData();


        if (props.connectedAddress === "" || props.provider === undefined)
            return;

        // get wallet balance in bigint format
        let bal = await props.provider.getBalance(props.connectedAddress);


        const pools = await props.poolFactory.getPools();

        if (pools.length === 0)
            return;

        // get latest pool
        let poolAddress = pools[pools.length - 1];

        // setup contract
        const contract = new ethers.Contract(
            poolAddress,
            PoolAritfact.abi,
            props.provider.getSigner(0)
        );

        // set the pool contract
        setPoolContract(contract);

        // set pool values
        getPoolBalance(contract);
        getDepositBalance(contract);

        // convert to ETH and float then update state
        setWalletBalance(parseFloat(ethers.utils.formatEther(bal)));

    }


    // return the amount of money pooled
    async function getPoolBalance(contract: ethers.Contract) {
        
        // get user balance
        let bal = await contract.getTotalBalance();

        // set balance
        setPoolBalance(parseFloat(ethers.utils.formatEther(bal.toString())));

    }

    // return the amount of stablecoin the user has deposited
    async function getDepositBalance(contract: ethers.Contract) {

        // get user balance
        const bal = await contract.balanceOf(props.connectedAddress);
        const formattedBal = parseFloat(ethers.utils.formatEther(bal.toString()));

        // set balance
        setDepositBalance(formattedBal);

        return bal;

    }


    useInterval(() => {

          if (poolContract !== undefined) {
            getPoolBalance(poolContract);
            getDepositBalance(poolContract);
          }

    }, 5000)

    // run on load
    useEffect(() => {

        // initialize vars
        initialize(); 

    }, []);

    // get latest gas prices 
    async function getGasPrice(speed?: string) {
        
        // make request w/ axios
        const price = await axios.get('https://ethgasstation.info/api/ethgasAPI.json?api-key=' + process.env.DEFI_PULSE_KEY)

        if (speed === "fastest")
            return(parseInt(price.data.fastest)/10);
        else if (speed === "fast")
            return(parseInt(price.data.fast)/10);
        else 
            return(parseInt(price.data.average)/10);

    }

    // load the creator data from firebase
    function getCreatorData() {

        // get the deck id from the URL
        let addr = window.location.pathname;
        addr = addr.substr(addr.lastIndexOf("/") + 1);
        console.log(addr);

        return;
        
        fetch("https://us-central1-source-app-1dd0b.cloudfunctions.net/getDeck?addr=" + addr)
        .then(response => response.json())
        .then((responseData) => {

            // update state
            // setDeck(responseData.data);
            // getImg("https://www.youtube.com/watch?v=-ZSx_E1QZgw");

        })
        .catch((error) => {
            // TODO: handle invalid deck
            console.log(error)
        })  
    }


    // deposit into pool
    async function depositClicked () {

        // no can do
        if (inputAmount === 0 || inputAmount > walletBalance || poolContract === undefined)
            return;

        // convert amount to wei 
        const value = ethers.utils.parseEther(inputAmount.toString());

        // get current gas prices
        const gasPrice = await getGasPrice();

        // deposit amount
        await poolContract.deposit({value: value, gasLimit:8000000, gasPrice: gasPrice * 1e9});

    }

    // withdraw from pool
    async function withdrawClicked() {

        // no can do
        if (inputAmount === 0  || poolContract === undefined)
            return;

        // convert amount to wei 
        // const value = ethers.utils.parseEther(inputAmount.toString());

        let userBalance = await getDepositBalance(poolContract);
        // console.log("withdrawing: ", userBalance);

        // get current gas prices
        const gasPrice = await getGasPrice();

        // deposit amount
        await poolContract.withdraw(userBalance, {gasLimit:8000000, gasPrice: gasPrice * 1e9});

    }


    // for now this will just create a new pool
    async function registerClicked(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {

        // prevent redirect
        event.preventDefault();

        // create a new pool with the address as owner
        const tx = await props.poolFactory.newPool("0x191De0792D4E78B001391001962a550dFbA61238");
        console.log(tx);

    }


    if (props.connectedAddress !== undefined) {
        return (
            <div className="page-wrapper">
                <div className="creator-wrapper">
                    <div className="creator-header">
                        <span className="pool-balance">Money Pooled: ${poolBalance.toPrecision(4)}</span>
                        <a href="/" className="register" onClick={(e) => registerClicked(e)}>Become a creator to start earning money</a>
                    </div>    
                    <div className="creator-profile">
                        <img alt="profile" src="https://boredhumans.b-cdn.net/faces2/13.jpg"></img>
                        <div className="creator-info">
                            <div className="info-top">
                                <span className="creator-name">John Doe </span> 
                                <a href={"https://kovan.etherscan.io/address/0x71435bf2d0766293f1c761e3ff7916aae1346642"}>(View on Etherscan)</a>
                            </div>
                            <div className="info-bottom">
                                <span className="creator-bio">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</span>
                            </div>
                        </div>
                    </div>
                    <div className="creator-middle">
                        <div className="creator-links middle-section">
                            <h2>MY LINKS</h2>
                            <div className="middle-text">
                                <ul>
                                    <li><a rel="noopener noreferrer" target="_blank" href="https://youtube.com">youtube.com/JohnDoeTV</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="creator-explain middle-section">
                            <h2>HOW THIS WORKS</h2>
                            <div className="middle-text">
                                <span>
                                    <b>Lump.Finance</b> is a platform that allows fans to financially support their 
                                    favorite creators without spending any money. Through the magic of <a rel="noopener noreferrer" target="_blank" href="https://ethereum.org/en/">Ethereum</a> and <a rel="noopener noreferrer" target="_blank" href="https://aave.com/"> AAVE's Lending Pools</a>, fans 
                                    can <b>lump</b> their funds together in a pool that generates interest to be collected by the creator. At any point fans can withdraw nearly 100% of their deposit (some is lost from Ethereum transaction fees)
                                    and creators can withdraw the accrued interest whenever needed without touching the money deposited by their fans.
                                </span>
                            </div>
                        </div>
                    </div>
                    {props.connectedAddress !== "" ? 
                        <div className="creator-actions">
                            <div className="input-wrapper">
                                <input type="number" className="input-amount" placeholder="Insert Amount in ETH" onChange={(e) => {setInputAmount(parseFloat(e.target.value))}}></input>
                                <span className="balance-amount">Wallet Balance: {walletBalance.toPrecision(4)} ETH</span>
                                <span className="balance-amount">Deposit Balance: ${depositBalance.toPrecision(4)} USD</span>
                            </div>
                            <div className="button-wrapper">
                                <button className="btn-deposit" onClick={depositClicked}>Deposit</button>
                                <button className="btn-withdraw" onClick={withdrawClicked}>Withdraw</button>
                            </div>
                        </div>
                    :
                        <div className="creator-actions dark">
                            <span>Connect your wallet to pool!</span>
                        </div>
                    }
                </div>
            </div>
        );
    } else {
        return(
           <Loading/> 
        );
    }
    
}

export default Creator;

