import { useCallback, memo, useTransition } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { config, CONNECTOR_MM, CONNECTOR_MM_FLASK_EXPORT, CONNECTOR_MM_REGULAR_EXPORT } from '../../config/wagmi';
import { useMetaMask, useWrongChain } from '../../hooks';
import { useOptimizedDropdown } from '../../hooks/useOptimizedDropdown';
import { truncateString } from '../../utils';
import { JazziconComponent } from '../common/JazziconComponent';
import { Chain } from './Chain';
import {
  MobileMenuButton,
  MobileMenuDropdown,
  DisconnectButton,
  MobileAddressDisplay,
  MobileConnectButton,
  MobileInstallLink
} from './styles';
import MenuIcon from '../../assets/menu.png';
import LogOutIcon from '../../assets/icons/logOut.svg';
import ArrowDownIcon from '../../assets/icons/arrowDown.svg';
import UpArrowIcon from '../../assets/icons/up-arrow.svg';

export const MobileMenu = memo(() => {
  const [, startTransition] = useTransition();
  const { isOpen, toggle, close, dropdownRef, buttonRef } = useOptimizedDropdown({
    closeOnOutsideClick: true,
  });
  
  const { isFlask, snapsDetected } = useMetaMask();
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect({ config });
  const { disconnect } = useDisconnect();
  useWrongChain();

  const connectorId = isFlask ? CONNECTOR_MM_FLASK_EXPORT.ID : CONNECTOR_MM_REGULAR_EXPORT.ID;

  const handleDisconnect = useCallback(() => {
    startTransition(() => {
      disconnect();
    });
    close();
  }, [disconnect, close]);

  const handleConnect = useCallback((connector: any) => {
    startTransition(() => {
      connect({ connector });
    });
    close();
  }, [connect, close]);

  return (
    <>
      <MobileMenuButton ref={buttonRef} onClick={toggle}>
        <img src={MenuIcon} alt="Menu" />
      </MobileMenuButton>
      
      <MobileMenuDropdown ref={dropdownRef} $isVisible={isOpen}>
        {isConnected ? (
          <>
            <MobileAddressDisplay>
              <JazziconComponent address={address || ''} type="from" size={18} />
              {address ? truncateString(address) : 'no address'}
            </MobileAddressDisplay>

            <Chain compact />

            <DisconnectButton onClick={handleDisconnect}>
              <LogOutIcon/>
              Disconnect
            </DisconnectButton>
          </>
        ) : (
          <>
            {!snapsDetected ? (
              <MobileInstallLink href={CONNECTOR_MM.INSTALLATION_URL} target="_blank">
                Install Metamask
              </MobileInstallLink>
            ) : (
              connectors.map(
                (connector) =>
                  connector.id === connectorId && (
                    <MobileConnectButton
                      key={connector.id}
                      onClick={() => handleConnect(connector)}
                    >
                      Connect wallet
                    </MobileConnectButton>
                  ),
              )
            )}
          </>
        )}
      </MobileMenuDropdown>
    </>
  );
});

MobileMenu.displayName = 'MobileMenu';
