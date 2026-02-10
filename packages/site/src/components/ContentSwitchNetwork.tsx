import { memo, useCallback, useTransition } from 'react';
import styled from 'styled-components';
import { useAccount, useSwitchChain } from 'wagmi';

import {
  ContentBorderWrapper,
  ContentContainer,
  ContentText,
  ContentTitle,
} from './styles';
import { getSupportedNetworks, isSupportedChainId } from '../config/networks';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.default};
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.2;
  color: #ffffff;
  background-color: #ff1900;
  border: none;
  border-radius: 12px;
  padding: 16px 40px;
  min-height: 4.2rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #e55a5a;
    box-shadow: 0 4px 12px rgba(30, 41, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
    background-color: #e55a5a;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
`;

export const ContentSwitchNetwork = memo(() => {
  const { switchChain } = useSwitchChain();
  const [, startTransition] = useTransition();
  const account = useAccount();
  const connectedChainId = account.chain?.id;
  const supportedNetworks = getSupportedNetworks();

  const handleSwitchChain = useCallback(
    (targetChainId: number) => {
      startTransition(() => {
        switchChain({ chainId: targetChainId });
      });
    },
    [switchChain],
  );

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Switch Network</ContentTitle>
        <ContentText>
          It looks like you are not on the COTI network, please switch network
          to continue.
        </ContentText>
        <ButtonsWrapper>
          {supportedNetworks.map((network) => (
            <StyledButton
              key={network.id}
              onClick={() => handleSwitchChain(network.id)}
              disabled={
                typeof connectedChainId === 'number' &&
                isSupportedChainId(connectedChainId) &&
                connectedChainId === network.id
              }
            >
              Switch to {network.shortName}
            </StyledButton>
          ))}
        </ButtonsWrapper>
      </ContentContainer>
    </ContentBorderWrapper>
  );
});

ContentSwitchNetwork.displayName = 'ContentSwitchNetwork';
