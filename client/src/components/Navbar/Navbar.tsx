import { useEthers } from '@usedapp/core'
import { Dispatch, SetStateAction } from 'react';
// @ts-ignore
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

/**
 * Navbar component
 */
export default function Navbar (props: {setShowModal: Dispatch<SetStateAction<boolean>>}) {
    const { account } = useEthers()
    const shortenedAddress = (addr: string) => {
        // shorten
        return `0x${addr.substring(2, 5)}...${addr.substring(
        addr.length - 4,
        addr.length
        )}`;
    };
    const renderWalletInfo = () => {
        if (!account) return;
        return(
            <div>
                <Jazzicon diameter={20} seed={jsNumberForAddress(account)} />
                {shortenedAddress(account)}
            </div>
        );
    }
    return (
        <div>
            <button onClick={() => props.setShowModal(true)}>
                {account ? renderWalletInfo() : "Connect Wallet"}
            </button>
        </div>
    );
}