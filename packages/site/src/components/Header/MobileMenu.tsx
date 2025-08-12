import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { config, CONNECTOR_MM, CONNECTOR_MM_FLASK_EXPORT, CONNECTOR_MM_REGULAR_EXPORT } from '../../config/wagmi';
import { useMetaMask, useWrongChain } from '../../hooks';
import { truncateString } from '../../utils';
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

export const MobileMenu = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { isFlask } = useMetaMask();
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect({ config });
  const { disconnect } = useDisconnect();
  const { wrongChain } = useWrongChain();

  const isMetaMaskInstalled =
    typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;

  const connectorId = isFlask ? CONNECTOR_MM_FLASK_EXPORT.ID : CONNECTOR_MM_REGULAR_EXPORT.ID;

  const toggleDropdown = () => setIsVisible(!isVisible);

  const handleDisconnect = () => {
    disconnect();
    setIsVisible(false);
  };

  const handleConnect = (connector: any) => {
    connect({ connector });
    setIsVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <MobileMenuButton ref={buttonRef} onClick={toggleDropdown}>
        <img src={MenuIcon} alt="Menu" />
      </MobileMenuButton>
      
      <MobileMenuDropdown ref={dropdownRef} $isVisible={isVisible}>
        {isConnected ? (
          <>
            <MobileAddressDisplay>
              {address ? truncateString(address) : 'no address'}
            </MobileAddressDisplay>
            
            {wrongChain && <Chain />}
            
            <DisconnectButton onClick={handleDisconnect}>
              Disconnect
            </DisconnectButton>
          </>
        ) : (
          <>
            {!isMetaMaskInstalled ? (
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
};