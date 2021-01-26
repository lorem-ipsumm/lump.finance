import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
import Loading from './Loading';
import "../css/creator.css";
import { ethers } from "ethers";
import PoolAritfact from "../contracts/Pool.json";
import contractAddress from "../contracts/contract-address.json";

/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
function Creator(props: {poolFactory: ethers.Contract, 
                         provider: ethers.providers.Web3Provider,
                         connectedAddress: string}) {

    const[creatorLoaded, setCreatorLoaded] = useState(false);
    const[walletBalance, setWalletBalance] = useState<number>(0);
    const[inputAmount, setInputAmount] = useState<number>(0);

    async function initialize() {

        // exit if not ready
        if (props.provider === undefined || props.poolFactory === undefined || props.connectedAddress === undefined)
            return;

        // get wallet balance in bigint format
        let bal = await props.provider.getBalance(props.connectedAddress);

        // convert to ETH and float then update state
        setWalletBalance(parseFloat(ethers.utils.formatEther(bal)));



    }

    // run on load
    useEffect(() => {

        // get decks
        // getDecks();

        initialize(); 

        setCreatorLoaded(true);

    }, []);


    async function depositClicked () {

        let poolAddress = (await props.poolFactory.getPools())[0];

        const poolContract = new ethers.Contract(
            poolAddress,
            PoolAritfact.abi,
            props.provider.getSigner(0)
        );

        const value = ethers.utils.parseEther(inputAmount.toString());

        await poolContract.deposit({value});

    }


    if (props.connectedAddress !== undefined) {
        return (
            <div className="page-wrapper">
                <div className="creator-wrapper">
                    <div className="creator-header">
                        <span className="pool-balance">Money Pooled: $3,032</span>
                        <a href="localhost:3000" className="register">Become a creator to start earning money</a>
                    </div>    
                    <div className="creator-profile">
                        <img alt="profile" src="https://boredhumans.b-cdn.net/faces2/13.jpg"></img>
                        <div className="creator-info">
                            <div className="info-top">
                                <span className="creator-name">John Doe</span>
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
                                    <li><a href="https://youtube.com">youtube.com/JohnDoeTV</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="creator-explain middle-section">
                            <h2>HOW THIS WORKS</h2>
                            <div className="middle-text">
                                <span>
                                    <b>Lump.Finance</b> is a platform that allows fans to financially support their 
                                    favorite creators without spending any money. Through the magic of <a href="https://ethereum.org/en/">Ethereum</a> and <a href="https://aave.com/"> AAVE's Lending Pools</a>, fans 
                                    can deposit funds into a pool which generates interest to be collected by the creator. At any point fans can withdraw nearly 100% of their deposit (some is lost from Ethereum transaction fees)
                                    and creators can withdraw the accrued interest whenever needed.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="creator-actions">
                        <div className="input-wrapper">
                            <input type="number" className="input-amount" placeholder="Insert Amount in ETH" onChange={(e) => {setInputAmount(parseFloat(e.target.value))}}></input>
                            <span className="balance-amount">Wallet Balance: {walletBalance} ETH</span>
                        </div>
                        <div className="button-wrapper">
                            <button className="btn-deposit" onClick={depositClicked}>Deposit</button>
                            <button className="btn-withdraw">Withdraw</button>
                        </div>
                    </div>
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

