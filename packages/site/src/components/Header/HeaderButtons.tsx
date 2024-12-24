import { useAccount, useConnect } from 'wagmi';

import {
  useMetaMask,
  // useInvokeSnap,
  // useMetaMaskContext,
} from '../../hooks';
import { Button } from '../Button';
import { ConnectedContainer, Link } from './styles';
import { WalletManager } from './WalletManager';

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    Install MetaMask Flask
  </Link>
);

export const HeaderButtons = () => {
  const { isFlask, installedSnap } = useMetaMask();

  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  // if (!isFlask && !installedSnap) {
  //   return <InstallFlaskButton />;
  // }

  // if (shouldDisplayReconnectButton(installedSnap)) {
  //   return <Button text="Reconnect" primary onClick={requestSnap} />;
  // }

  return (
    <ConnectedContainer>
      {isConnected ? (
        <WalletManager />
      ) : (
        <>
          {!isFlask && !installedSnap ? (
            <InstallFlaskButton />
          ) : (
            connectors.map(
              (connector) =>
                connector.id === 'io.metamask.flask' && (
                  <Button
                    key={connector.id}
                    text="Connect wallet"
                    primary
                    onClick={() => connect({ connector })}
                  />
                ),
            )
          )}
        </>
      )}
    </ConnectedContainer>
  );
};
