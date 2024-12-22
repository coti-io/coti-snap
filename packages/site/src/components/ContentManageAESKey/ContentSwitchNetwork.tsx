import React from 'react';
import { useSwitchChain } from 'wagmi';

import { Button } from '../Button';
import { ContentContainer, ContentText, ContentTitle } from './style';

export const ContentSwitchNetwork = () => {
  const { switchChain } = useSwitchChain();
  const handleSwitchChain = () => {
    switchChain({ chainId: 13068200 });
  };

  return (
    <ContentContainer>
      <ContentTitle>Switch Network</ContentTitle>
      <ContentText>
        It looks like you are not on the COTI network, please change network to
        continue.
      </ContentText>
      <Button primary text="Switch Network" onClick={handleSwitchChain} />
    </ContentContainer>
  );
};
