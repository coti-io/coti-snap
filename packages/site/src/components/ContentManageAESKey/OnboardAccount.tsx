import React from 'react';

import { Button } from '../Button';
import { ContentText, ContentTitle } from './style';

export const OnboardAccount = () => {
  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentText>Start with the onboarding of your account</ContentText>
      <Button primary text="Onboard account" />
    </>
  );
};
