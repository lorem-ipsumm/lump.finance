import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
import Loading from './Loading';
import "../css/creator.css";

/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
function Creator() {

    const[creatorLoaded, setCreatorLoaded] = useState(false);

    // run on load
    useEffect(() => {

        // get decks
        // getDecks();

    }, []);


    if (!creatorLoaded) {
        return (
            <div className="page-wrapper">
                <div className="creator-wrapper">
                    <div className="creator-header">
                        <span className="pool-balance">Money Pooled: $3,032</span>
                        <a href="" className="register">Become a creator to start earning money</a>
                    </div>    
                    <div className="creator-profile">
                        <img src="https://boredhumans.b-cdn.net/faces2/13.jpg"></img>
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
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                    <li><a href="">youtube.com/JohnDoeTV</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="creator-explain middle-section">
                            <h2>HOW THIS WORKS</h2>
                            <div className="middle-text">
                                <span>
                                    <b>Lump.Finance</b> is a platform that allows fans to financially support their 
                                    favorite creators without spending any money. Through the magic of <a href="">Ethereum</a> and <a href=""> AAVE's Lending Pools</a>, fans 
                                    can deposit funds into a pool which generates interest to be collected by the creator. At any point fans can withdraw nearly 100% of their deposit (some is lost from Ethereum transaction fees)
                                    and creators can withdraw the accrued interest whenever needed.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="creator-actions">
                        <input type="number" className="input-amount" placeholder="$0.00"></input>
                        <span className="balance-amount">Your Balance: $123.45</span>
                        <div className="button-wrapper">
                        <button className="btn-deposit">Deposit</button>
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

