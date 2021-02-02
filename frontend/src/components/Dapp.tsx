import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
// import Loading from './Loading';
import "../css/main.css";
import "../css/resize.css";
import Creator from './Creator';
import Loading from './Loading';
import Particles from 'react-particles-js';
import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import PoolFactoryArtifact from "../contracts/PoolFactory.json";


// ethereum.window fix
declare global {
    interface Window {
        ethereum:any;
    }
}

/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
export function Dapp() {

    // const[creatorLoaded, setCreatorLoaded] = useState(false);
    const[connectedAddress, setConnectedAddress] = useState<string>("");
    const[initialized, setInitialized] = useState<boolean>(false);
    const[provider, setProvider] = useState<any>(undefined);
    const[poolFactory, setPoolFactory] = useState<ethers.Contract>(new ethers.Contract(
        contractAddress.PoolFactory,
        PoolFactoryArtifact.abi
    ));

    // parameters for particles
    const params = {
	    "particles": {
	        "number": {
	            "value": 50
	        },
	        "size": {
	            "value": 1
	        }
        },
        "line_linked": {
            "enable": false
        },
	    "interactivity": {
	        "events": {
	            "onhover": {
	                "enable": true,
	                "mode": "repulse"
	            }
	        }
	    }
    }

    // set dappp data
    async function initialize(userAddress: string) {

        setConnectedAddress(userAddress);

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

        // initialize provider
        setProvider(web3Provider);

        // setup PoolFactory contract
        const contract = new ethers.Contract(
            contractAddress.PoolFactory,
            PoolFactoryArtifact.abi,
            web3Provider.getSigner(0)
        );

        // When, we initialize the contract using that provider and the token's
        // artifact. You can do this same thing with your contracts.
        setPoolFactory(contract);

        return;


        /*
        let pools = await contract.getPools();
        // console.log(pools);

        let balance = await web3Provider.getBalance(userAddress);
        // console.log(ethers.utils.formatEther(balance.toString()) + " " + ethers.constants.EtherSymbol);

        // console.log(userAddress);
        setInitialized(true);
        */
    }
    
    // connect to the users wallet
    async function connectWallet() {

        let selectedAddress;

        // To connect to the user's wallet, we have to run this method.
        // It returns a promise that will resolve to the user's address.
        try {
            [selectedAddress] = await window.ethereum.enable();
        } catch (err) {
            console.log()
            setInitialized(true);
            return;
        }


        // Once we have the address, we can initialize the application.

        // First we check the network
        // if (!this._checkNetwork()) {
        // return;
        // }

        // setup vars
        await initialize(selectedAddress);


        // listen for wallet account changes to update dapp vars
        window.ethereum.on("accountsChanged", ([newAddress]: string[]) => {

            // initialize with new address
            if (newAddress !== undefined)
                initialize(newAddress);

        });

        // We reset the dapp state if the network is changed
        window.ethereum.on("networkChanged", async ([networkId]: string[]) => {
            const [selectedAddress] = await window.ethereum.enable();

            // initialize on new network w/ selected address
            if (selectedAddress !== undefined)
                initialize(selectedAddress);

        });

    }


    // run on load
    useEffect(() => {


        // this is fake loading for now
        setTimeout(() => {

            // check for wallet
            if (window.ethereum === undefined){
                // return;
                setInitialized(true);
                return;
            }


            if (connectedAddress === "") {
                connectWallet();
            } else {
                setInitialized(true);
            }
        }, 1000);

    // eslint-disable-next-line
    }, [connectedAddress]);


   if (!initialized) {
       return(
            <div className="page-wrapper">
                <Particles params={params}/>
                <Loading/>
            </div>
       );
    } else {
        return(
            <div className="page-wrapper">
                <Particles params={params}/>
                <Creator poolFactory={poolFactory} provider={provider} connectedAddress={connectedAddress}/>
            </div>
        );
    }
    
}



