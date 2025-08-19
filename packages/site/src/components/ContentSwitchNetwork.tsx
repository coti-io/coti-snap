import { useSwitchChain } from 'wagmi';
import { useCallback, memo, useTransition } from 'react';

import { CHAIN_ID } from '../config/wagmi';
import { ContentBorderWrapper, ContentContainer, ContentText, ContentTitle } from './styles';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.default};
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.2;
  color: #FFFFFF;
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

export const ContentSwitchNetwork = memo(() => {
  const { switchChain } = useSwitchChain();
  const [, startTransition] = useTransition();
  
  const handleSwitchChain = useCallback(() => {
    startTransition(() => {
      switchChain({ chainId: CHAIN_ID });
    });
  }, [switchChain]);

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Switch Network</ContentTitle>
        <ContentText>
          It looks like you are not on the COTI network, please switch network to
          continue.
        </ContentText>
        <StyledButton onClick={handleSwitchChain}>Switch Network</StyledButton>
      </ContentContainer>
    </ContentBorderWrapper>
  );
});

ContentSwitchNetwork.displayName = 'ContentSwitchNetwork';
