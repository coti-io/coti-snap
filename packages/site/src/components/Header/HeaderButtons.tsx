import { useAccount, useConnect } from 'wagmi';

import { config, CONNECTOR_MM } from '../../config/wagmi';
import { useMetaMask } from '../../hooks';
import { Button } from '../Button';
import { ConnectedContainer, Link } from './styles';
import { WalletManager } from './WalletManager';

export const InstallWalletButton = () => (
  <Link href={CONNECTOR_MM.INSTALLATION_URL} target="_blank">
    Install Metamask
  </Link>
);

export const HeaderButtons = () => {
  const { isFlask, installedSnap } = useMetaMask();
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect({ config });

  const isMetaMaskInstalled =
    typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;

  return (
    <ConnectedContainer>
      {isConnected ? (
        <WalletManager />
      ) : (
        <>
          {!isFlask && !installedSnap && !isMetaMaskInstalled ? (
            <InstallWalletButton />
          ) : (
            connectors.map(
              (connector) =>
                connector.id === CONNECTOR_MM.ID && (
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
