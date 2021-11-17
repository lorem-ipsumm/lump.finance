import React, { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Creator from './pages/Creator/Creator';
import ConnectWallet from './components/ConnectWallet/ConnectWallet';
import { useEthers } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { walletconnect } from "./components/Connectors";
import { walletlink } from "./components/Connectors";
import { ethers } from 'ethers';
import addresses from './data/addresses.json';
import abis from './data/abis.json';
import NewCreator from './pages/NewCreator/NewCreator';


export default function App() {
  const {
    activateBrowserWallet,
    account,
    activate,
    deactivate,
    active,
    library,
  } = useEthers();
  const [showModal, setShowModal] = useState(false);
  const [poolFactory, setPoolFactory] = useState<ethers.Contract>();


  // connect to web3
  const connect = async (provider: string) => {
    if (provider === "metamask") {
      activateBrowserWallet();
    } else if (provider === "walletconnect") {
      activate(walletconnect, (e) => {
        console.log(e);
      });
    } else if (provider === "walletlink") {
      activate(walletlink);
    }
  };

  return (
      <div className="App">
        {showModal && (
          <ConnectWallet
            showModal={showModal}
            setShowModal={setShowModal}
            connect={connect}
          />
        )}
        <Navbar setShowModal={setShowModal}/>
        <NewCreator/>
      </div>
  );
}