import { useConnect } from 'wagmi';
import { ContentContainer, ContentText, ContentTitle } from './styles';
import { config, CONNECTOR_ID } from '../config/wagmi';

export const ContentConnectYourWallet = () => {
  const { connectors, connect } = useConnect({ config });
  return (
    <ContentContainer>
      <ContentTitle>Connect Your Wallet</ContentTitle>
      <ContentText>
        Please connect your wallet to start your account onboarding.
      </ContentText>
    </ContentContainer>
  );
};
