import { useConnect } from 'wagmi';

import { config } from '../config/wagmi';
import { ContentContainer, ContentText, ContentTitle } from './styles';

export const ContentConnectYourWallet = () => {
  const { connectors, connect } = useConnect({ config });
  return (
    <ContentContainer>
      <ContentTitle>Connect Your Wallet</ContentTitle>
      <ContentText>Please connect your wallet to get started.</ContentText>
    </ContentContainer>
  );
};
