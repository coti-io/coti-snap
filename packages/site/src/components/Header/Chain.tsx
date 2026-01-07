import { useCallback, memo } from 'react';
import { useSwitchChain, useAccount } from 'wagmi';
import styled from 'styled-components';
import { getSupportedNetworks, getNetworkConfig, isSupportedChainId } from '../../config/networks';
import { useOptimizedDropdown } from '../../hooks/useOptimizedDropdown';
import { ConnectedDetails, Dropdown } from './styles';
import DownArrowIcon from '../../assets/icons/down-arrow.svg';

const ChainWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ChainButton = styled(ConnectedDetails)<{ $isOpen?: boolean }>`
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
    stroke: currentColor;
    flex-shrink: 0;
  }

  ${(props) => props.$isOpen && `
    svg {
      transform: rotate(180deg);
    }
  `}
`;

const ChainDropdown = styled(Dropdown)`
  left: auto;
  right: 0;
  min-width: 180px;
  padding: 8px;
  gap: 4px;
`;

const NetworkOption = styled.button<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.button};
  background-color: ${(props) => props.$isActive ? props.$color : 'rgba(0, 0, 0, 0.03)'};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 500;
  cursor: ${(props) => props.$isActive ? 'default' : 'pointer'};
  transition: all 0.2s ease-in-out;
  font-family: ${({ theme }) => theme.fonts.default};
  text-align: left;
  width: 100%;

  &, & * {
    color: ${(props) => props.$isActive ? '#FFFFFF' : '#000000'} !important;
  }

  &:hover {
    background-color: ${(props) => props.$isActive ? props.$color : 'rgba(0, 0, 0, 0.08)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NetworkDot = styled.span<{ $color: string; $isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$isActive ? '#FFFFFF' : props.$color};
  flex-shrink: 0;
`;

const NetworkName = styled.span`
  flex: 1;
  color: inherit;
`;

const CheckMark = styled.span`
  font-size: 14px;
  color: inherit;
`;

export const Chain = memo(() => {
  const { switchChain, isPending } = useSwitchChain();
  const { chain } = useAccount();
  const { isOpen, toggle, close, dropdownRef } = useOptimizedDropdown({
    closeOnOutsideClick: true,
  });

  const currentChainId = chain?.id;
  const isSupported = isSupportedChainId(currentChainId);
  const currentNetwork = isSupported ? getNetworkConfig(currentChainId) : null;
  const supportedNetworks = getSupportedNetworks();

  const handleSwitchChain = useCallback((chainId: number) => {
    if (chainId === currentChainId || isPending) return;
    switchChain({ chainId });
    close();
  }, [switchChain, currentChainId, isPending, close]);

  const displayName = !isSupported
    ? 'Wrong chain'
    : currentNetwork?.name || 'Unknown';

  return (
    <ChainWrapper ref={dropdownRef}>
      <ChainButton
        as="button"
        onClick={toggle}
        $wrongChain={!isSupported}
        $isOpen={isOpen}
        $padding="10px 16px"
        disabled={isPending}
      >
        {displayName}
        <DownArrowIcon />
      </ChainButton>

      <ChainDropdown $isVisible={isOpen}>
        {supportedNetworks.map((network) => {
          const isActive = network.id === currentChainId;
          return (
            <NetworkOption
              key={network.id}
              onClick={() => handleSwitchChain(network.id)}
              $isActive={isActive}
              $color={network.color}
              disabled={isPending}
            >
              <NetworkDot $color={network.color} $isActive={isActive} />
              <NetworkName>{network.name}</NetworkName>
              {isActive && <CheckMark>✓</CheckMark>}
            </NetworkOption>
          );
        })}
      </ChainDropdown>
    </ChainWrapper>
  );
});

Chain.displayName = 'Chain';
