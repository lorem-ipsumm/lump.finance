import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
import useInterval from '../../components/UseInterval'
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import "./creator.css";
import { ethers } from "ethers";
// import PoolAritfact from "../contracts/Pool.json";
import axios from 'axios';
// import db from '../components/firestore';
// import { tokens } from "../components/tokens";
import addresses from "../../data/addresses.json";
import abis from "../../data/abis.json";
import { useEthers } from '@usedapp/core';
import { createClient } from '@supabase/supabase-js';

interface UserData {
    address: string,
    bio: string,
    links: any,
    name: string,
    pool: string
}


/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
function Creator() {
    // const[creatorLoaded, setCreatorLoaded] = useState(false);
    const[walletBalance, setWalletBalance] = useState<number>(0);
    const[inputAmount, setInputAmount] = useState<number>(0);
    const[depositBalance, setDepositBalance] = useState<number>(0);
    const[depositBalanceETH, setDepositBalanceETH] = useState<number>(0);
    const[poolContract, setPoolContract] = useState<ethers.Contract>();
    const[poolBalance, setPoolBalance] = useState<number>(0);
    const[dataLoaded, setDataLoaded] = useState<boolean>(false);
    const[displayName, setDisplayName] = useState<string>("");
    const[bio, setBio] = useState<string>("");
    const[links, setLinks] = useState<string[]>([]);
    const[poolAddress, setPoolAddress] = useState<string>("");
    const[isOwner, setIsOwner] = useState<boolean>(false);
    const[creatorBalance, setCreatorBalance] = useState<number>(0); 
    const[networkId, setNetworkId] = useState<number>(-1);
    // TODO: turn into react hook to grab in other components
    const supabaseUrl = 'https://jrhbzfyqzasjvzswomvz.supabase.co'
    const supabaseKey:string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjY1NzI0NywiZXhwIjoxOTUyMjMzMjQ3fQ.xztJS8cv7ENBYR9Np0CJZIiY5ucpTZaMlMPFALsuVB4';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
        library,
        account
    } = useEthers();

    // const history = useHistory();

    async function initialize() {

        // no wallet connected
        const wallet = library ? library : new ethers.providers.JsonRpcProvider('https://restless-quiet-brook.quiknode.pro/e94faf0f8b90596f37e70f5c94d68c5009095d44/');

        // load the creator's data
        getCreatorData();

        if (poolAddress === "")
            return;

        const poolFactory = new ethers.Contract(
            addresses.PoolFactory,
            abis.PoolFactory,
            wallet
        );

        const pools = await poolFactory.getPools();

        if (pools.length === 0)
            return;

        // setup contract
        const contract = new ethers.Contract(
            poolAddress,
            abis.Pool,
            wallet
        );

        // load user specific data using their wallet
        if (library && account) {
            // get wallet balance in bigint format
            let bal = await library.getBalance(account);
            // set network ID
            setNetworkId(library._network.chainId);
            // convert to ETH and float then update state
            setWalletBalance(parseFloat(ethers.utils.formatEther(bal)));
        }

        // set the pool contract
        setPoolContract(contract);

        // set pool values
        getPoolBalance(contract);
        getDepositBalance(contract);


    }


    // return the amount of money pooled
    async function getPoolBalance(contract: ethers.Contract) {
        
        // get user balance
        // let bal = await contract.getTotalBalance();

        if (!library) return;

        // setup contract
        const aDAI = new ethers.Contract(
            addresses.aDAI,
            abis.aDAI,
            library.getSigner(0)
        );

        // get contract balance of aDAI
        let bal = await aDAI.balanceOf(contract.address);

        // is the user the owner of the pool
        // TODO: it may be safe to not do this clientside
        // I'm not sure if people can just impersonate other wallets
        if (isOwner) {
            // get the creators balance
            let cBal = await contract.getCreatorBalance();
            cBal = ethers.utils.formatEther(cBal.toString());
            setCreatorBalance(parseFloat(cBal));
        }

        // set balance
        setPoolBalance(parseFloat(ethers.utils.formatEther(bal.toString())));

        setDataLoaded(true);

    }

    // return the amount of stablecoin the user has deposited
    async function getDepositBalance(contract: ethers.Contract) {

        if (!account) return;

        // get user balance
        const bal = await contract.balanceOf(account);
        const formattedBal = parseFloat(ethers.utils.formatEther(bal.toString()));

        // weth address
        let weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

        // get price of eth
        const priceRequest = await axios.get('https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&vs_currencies=usd')
        const price = parseFloat(priceRequest.data[weth].usd);

        // set balance
        setDepositBalance(formattedBal);

        if (formattedBal > 0)
            setDepositBalanceETH(price/formattedBal)


        return bal;

    }


    useInterval(() => {

          if (poolContract !== undefined) {
            getPoolBalance(poolContract);
            getDepositBalance(poolContract);
          } else {
              initialize();
          }

    }, 1000)

    // run on load
    useEffect(() => {

    }, [poolBalance, networkId]);

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
    // returns address of creator
    async function getCreatorData() {

        if (!account) return;

        // get the deck id from the URL
        let addr = window.location.pathname;
        addr = addr.substr(addr.lastIndexOf("/") + 1);
        addr = "0x1CbbD0F87996c404e3b6138758fEA736A0De64fa";

        /*
        // check if addr is valid. if not use default
        if (addr.length !== 42 && props.connectedAddress === "") {
            // addr = "0x39a7baa3fcb68ad38377ea4ebb402296dd69d981";
            history.push("/new-creator/");
        } else if (addr.length !== 42 && props.connectedAddress !== "") {
            // load the account based on the connected wallet if it is connected
            addr = props.connectedAddress;
            history.push("/creator/" + props.connectedAddress);
        }
        */

        // check if this is the owner's page
        if (addr.toLocaleLowerCase() === account.toLowerCase())
            setIsOwner(true);

        // get user data
        const { data: _data, error } = await supabase
            .from("users")
            .select("address,name,bio,pool,links")
            .match({address: addr});

        if (error) {
            console.log("creator data failed to load");
            return;
        } else {
            if (!_data) return;
            const data:UserData[] = _data;
            const userData = data[0];

            // update state vars
            setDisplayName(userData.name);
            setBio(userData.bio);
            setPoolAddress(userData.pool);
            setLinks(userData.links);
        }

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
        await poolContract.deposit({value: value, gasLimit:900000, gasPrice: 10 * 1e9});

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
        await poolContract.withdraw(userBalance, {gasLimit:900000, gasPrice: 10 * 1e9});

    }

    // withdraw creator's deposit from ppol
    async function creatorWithdrawClicked() {

        // no can do
        if (poolContract === undefined)
            return;

        // get the amount to withdraw
        let amount = ethers.utils.parseEther(creatorBalance.toString());


        // get current gas prices
        const gasPrice = await getGasPrice();

        // deposit amount
        await poolContract.creatorWithdraw(amount, {gasLimit:900000, gasPrice: 10 * 1e9});

    }

    if (dataLoaded) {
        return (
            <div className="page-wrapper">
                <div className="creator-wrapper">
                    <div className="creator-header">
                        <span className="pool-balance">Money Pooled: ${poolBalance.toFixed(5)} USD</span>
                        <Link to="/new-creator" className="register">Create your own page here</Link>
                    </div>    
                    <div className="creator-profile">
                        <div className="creator-info">
                            <div className="info-top">
                                <span className="creator-name">{displayName}</span> 
                                <a rel="noopener noreferrer" target="_blank" href={"https://kovan.etherscan.io/address/" + poolAddress}>(View on Etherscan)</a>
                            </div>
                            <div className="info-bottom">
                                <span className="creator-bio">{bio}</span>
                            {isOwner ? 
                                <div className="creator-withdraw-wrapper">
                                    <span className="creator-withdraw"onClick={creatorWithdrawClicked} >Available for withdraw: ${creatorBalance} USD</span>
                                </div>
                            :
                                <div></div>
                            }
                            </div>
                        </div>
                    </div>
                    <div className="creator-middle">
                        <div className="creator-links middle-section">
                            <h2>MY LINKS</h2>
                            <div className="middle-text">
                                <ul>
                                    {links.map((link, i) => (<li key={i}><a rel="noopener noreferrer" target="_blank" href={link}>{link}</a></li>))} 
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
                    {account ? 
                        <div className="creator-actions">
                            <div className="input-wrapper">
                                <input type="number" className="input-amount" placeholder="Insert Amount in ETH" onChange={(e) => {setInputAmount(parseFloat(e.target.value))}}></input>
                                <span className="balance-amount">Wallet Balance: {walletBalance.toFixed(2)} ETH</span>
                                <span className="balance-amount">Your Deposit: ${depositBalance.toFixed(2)} USD</span>
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
        return(<Loading/>);
    }
    
}

export default Creator;

