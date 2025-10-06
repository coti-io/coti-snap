import { useCallback, memo, useTransition } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { Chain } from './Chain';
import { ConnectedDetails, Dropdown, DisconnectButton } from './styles';
import { useOptimizedDropdown } from '../../hooks/useOptimizedDropdown';
import LogOutIcon from '../../assets/icons/logOut.svg';
import { AddressDisplay } from './AddressDisplay';

export const WalletManager = memo(() => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [, startTransition] = useTransition();
  const { isOpen, toggle, close, dropdownRef } = useOptimizedDropdown({
    closeOnOutsideClick: true,
  });

  const handleDisconnect = useCallback(() => {
    startTransition(() => {
      disconnect();
    });
    close();
  }, [disconnect, close]);

  return (
    <>
      <ConnectedDetails $wrongChain={false} onClick={toggle} $padding="10px 30px">
        <AddressDisplay address={address || ''} />
        <Dropdown ref={dropdownRef} $isVisible={isOpen}>
          <DisconnectButton onClick={handleDisconnect}>
            <LogOutIcon/>
            Disconnect
          </DisconnectButton>
        </Dropdown>
      </ConnectedDetails>
      <Chain />
    </>
  );
});

WalletManager.displayName = 'WalletManager';
