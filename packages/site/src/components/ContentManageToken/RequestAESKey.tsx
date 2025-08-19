import React from 'react';
import styled, { keyframes } from 'styled-components';
import { SendButton } from './styles';
import SpinnerIcon from '../../assets/spinner.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #18191d !important;
`;

const Description = styled.p`
  font-size: 16px;
  color: #18191d !important;;
  margin-bottom: 24px;
  line-height: 1.5;
  font-weight: 450;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerImage = styled.img`
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
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
      <Title>Unlock Your Balances</Title>
      <Description>
      To view and manage your private balances, please allow access to your security key.
      </Description>
      <SendButton
        onClick={onRequestAESKey}
        disabled={isRequesting}
      >
        {isRequesting ? <SpinnerImage src={SpinnerIcon} alt="Loading" /> : undefined}
        {isRequesting ? 'Requesting' : 'Request'}
      </SendButton>
    </Container>
  );
};