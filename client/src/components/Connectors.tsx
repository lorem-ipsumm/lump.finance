import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: "https://restless-quiet-brook.quiknode.pro/e94faf0f8b90596f37e70f5c94d68c5009095d44/",
    4: "https://rinkeby.infura.io/v3/ba80b08e962a4d3b97bf1f61b5e057b2",
  },
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: 'https://restless-quiet-brook.quiknode.pro/e94faf0f8b90596f37e70f5c94d68c5009095d44/',
  appName: 'Lump.Finance',
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001]
})