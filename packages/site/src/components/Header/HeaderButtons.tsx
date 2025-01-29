import { useAccount, useConnect } from 'wagmi';

import { config, CONNECTOR_ID } from '../../config/wagmi';
import { useMetaMask } from '../../hooks';
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
  const { connectors, connect } = useConnect({ config });

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
                connector.id === CONNECTOR_ID && (
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
