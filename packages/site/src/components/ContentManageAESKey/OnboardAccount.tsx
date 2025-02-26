import { useState } from 'react';

import { Button } from '../Button';
import { ContentText, ContentTitle } from '../styles';
import { OnboardAccountWizzard } from './OnboardAccountWizzard';

export const OnboardAccount = () => {
  const [startOnboarding, setStartOnboarding] = useState<boolean>(false);

  const handleOnboardAccount = () => {
    setStartOnboarding(!startOnboarding);
  };

  return startOnboarding ? (
    <OnboardAccountWizzard handleOnboardAccount={handleOnboardAccount} />
  ) : (
    <>
      <ContentTitle>Onboard Account</ContentTitle>
      <ContentText>
        Start with onboarding your account so that your wallet could interact
        with private chain data, for example: your balance in a private ERC20
        token.
      </ContentText>
      <Button primary text="Onboard account" onClick={handleOnboardAccount} />
    </>
  );
};
