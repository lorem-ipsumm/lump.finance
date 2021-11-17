import './connectWallet.css';
import { Modal } from '@material-ui/core'
import React from 'react'
import metamask from "../../assets/providers/metamask.png";
import walletConnect from "../../assets/providers/walletconnect.png";
import walletLink from "../../assets/providers/walletlink.png";


export default function ConnectWallet(props: {
  connect: (x: any) => void;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}) {
  const options = ["MetaMask", "WalletConnect", "WalletLink"];

  // choose provider and connect
  const onClick = (e: any, index: number) => {
    props.connect(options[index].toLowerCase());
    props.setShowModal(false);
  };

  const getProvider = (option: string) => {
    if (option === "metamask") return metamask;
    else if (option === "walletconnect") return walletConnect;
    else if (option === "walletlink") return walletLink;
  };

  return (
    <Modal
      open={props.showModal}
      onClose={() => props.setShowModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="walletModal">
        {options.map((option, index) => (
          <div
            key={index}
            className="walletProvider"
            onClick={(e) => onClick(e, index)}
          >
            <img
              src={getProvider(option.toLowerCase())}
              alt={`${option.toLowerCase()}`}
              width={50}
              height={50}
            />
            <span>{option}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}