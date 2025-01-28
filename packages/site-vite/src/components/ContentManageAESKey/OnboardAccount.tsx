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
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentText>Start with the onboarding of your account</ContentText>
      <Button primary text="Onboard account" onClick={handleOnboardAccount} />
    </>
  );
};
