import { useSwitchChain } from 'wagmi';

import { CHAIN_ID } from '../config/wagmi';
import { Button } from './Button';
import { ContentBorderWrapper, ContentContainer, ContentText, ContentTitle } from './styles';

export const ContentSwitchNetwork = () => {
  const { switchChain } = useSwitchChain();
  const handleSwitchChain = () => {
    switchChain({ chainId: CHAIN_ID });
  };

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Switch Network</ContentTitle>
        <ContentText>
          It looks like you are not on the COTI network, please switch network to
          continue.
        </ContentText>
        <Button primary text="Switch Network" onClick={handleSwitchChain} />
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
