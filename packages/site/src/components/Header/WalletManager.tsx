import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { truncateString } from '../../utils';
import { Button } from '../Button';
import { Chain } from './Chain';
import { ConnectedDetails, Dropdown } from './styles';

export const WalletManager = () => {
  const { address } = useAccount();

  const { disconnect } = useDisconnect();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsVisible(!isVisible);

  const handleClickOutside = (vnt: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(vnt.target as Node)
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
      <ConnectedDetails $wrongChain={false} onClick={toggleDropdown}>
        {address ? truncateString(address) : 'no address'}
        <Dropdown ref={dropdownRef} $isVisible={isVisible}>
          <Button text="Disconnect" error onClick={disconnect} />
        </Dropdown>
      </ConnectedDetails>
      <Chain />
    </>
  );
};
