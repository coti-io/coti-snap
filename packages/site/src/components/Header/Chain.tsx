import { useCallback, memo } from 'react';
import { useSwitchChain, useAccount } from 'wagmi';
import styled from 'styled-components';
import { getSupportedNetworks, getNetworkConfig, isSupportedChainId } from '../../config/networks';
import { useOptimizedDropdown } from '../../hooks/useOptimizedDropdown';
import { ConnectedDetails, Dropdown } from './styles';
import DownArrowIcon from '../../assets/icons/down-arrow.svg';

const ChainWrapper = styled.div<{ $compact?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  overflow: visible;
  z-index: 900;
  width: ${(props) => (props.$compact ? '100%' : 'auto')};
  align-self: ${(props) => (props.$compact ? 'stretch' : 'auto')};
  flex-direction: ${(props) => (props.$compact ? 'column' : 'row')};
  align-items: ${(props) => (props.$compact ? 'stretch' : 'center')};
`;

const ChainButton = styled(ConnectedDetails)<{ $isOpen?: boolean; $compact?: boolean }>`
  gap: ${(props) => (props.$compact ? '6px' : '8px')};
  font-size: ${(props) => (props.$compact ? props.theme.fontSizes.small : '14px')};
  line-height: ${(props) => (props.$compact ? '1.2' : '1.4')};
  padding: ${(props) => (props.$compact ? '12px 16px' : '10px 16px')};
  width: ${(props) => (props.$compact ? '100%' : 'auto')};
  justify-content: ${(props) => (props.$compact ? 'space-between' : 'center')};
  min-height: ${(props) => (props.$compact ? '4.2rem' : 'auto')};
  height: ${(props) => (props.$compact ? '4.2rem' : 'auto')};
  flex-shrink: 0;
  background-color: ${(props) =>
    props.$compact && !props.$wrongChain ? 'rgb(42, 52, 65)' : undefined};
  border: ${(props) =>
    props.$compact && !props.$wrongChain ? 'none' : undefined};

  ${(props) =>
    props.$compact &&
    !props.$wrongChain &&
    `
      &:hover {
        background-color: rgb(52, 62, 75);
      }
    `}

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

const ChainDropdown = styled(Dropdown)<{ $compact?: boolean }>`
  left: auto;
  right: 0;
  min-width: ${(props) => (props.$compact ? '160px' : '180px')};
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: ${(props) => (props.$compact ? '6px' : '8px')};
  gap: ${(props) => (props.$compact ? '2px' : '4px')};
  z-index: 900;
  width: ${(props) => (props.$compact ? '100%' : 'auto')};

  ${(props) =>
    props.$compact &&
    `
      position: static;
      margin-top: 8px;
      min-width: 100%;
      align-self: stretch;
      max-height: none;
      overflow: visible;
      width: 100%;
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
      opacity: 1;
      visibility: visible;
      transform: none;
      transition: none;
      display: ${props.$isVisible ? 'flex' : 'none'};
    `}

  @media screen and (max-width: 768px), screen and (max-height: 700px) {
    ${(props) =>
      props.$compact
        ? ''
        : `
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 10px;
    `}
  }
`;

const NetworkOption = styled.button<{ $isActive: boolean; $color: string; $compact?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${(props) => (props.$compact ? '12px 16px' : '10px 12px')};
  min-height: ${(props) => (props.$compact ? '4.2rem' : '40px')};
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

export const Chain = memo(
  ({
    compact = false,
  }: {
    compact?: boolean;
  }) => {
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
    ? 'Wrong Chain'
    : currentNetwork?.name || 'Unknown';

  return (
    <ChainWrapper ref={dropdownRef} $compact={compact}>
      <ChainButton
        as="button"
        onClick={toggle}
        $wrongChain={!isSupported}
        $isOpen={isOpen}
        $compact={compact}
        disabled={isPending}
      >
        {displayName}
        <DownArrowIcon />
      </ChainButton>

      <ChainDropdown $isVisible={isOpen} $compact={compact}>
        {supportedNetworks.map((network) => {
          const isActive = network.id === currentChainId;
          return (
            <NetworkOption
              key={network.id}
              onClick={() => handleSwitchChain(network.id)}
              $isActive={isActive}
              $color={network.color}
              $compact={compact}
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
