import React from 'react';
import styled from 'styled-components';
import { SendButton } from './styles';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 300px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #18191d;
`;

const Description = styled.p`
  font-size: 1.4rem;
  color: #6b7280;
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
`;

interface RequestAESKeyProps {
  onRequestAESKey: () => Promise<void>;
  isRequesting: boolean;
}

export const RequestAESKey: React.FC<RequestAESKeyProps> = ({
  onRequestAESKey,
  isRequesting
}) => {
  return (
    <Container>
      <Title>AES Key Required</Title>
      <Description>
        To view and manage your encrypted token balances, please approve the retrieval of your AES Key.
      </Description>
      <SendButton
        onClick={onRequestAESKey}
        disabled={isRequesting}
      >
        {isRequesting ? 'Requesting...' : 'Get your AES Key'}
      </SendButton>
    </Container>
  );
};