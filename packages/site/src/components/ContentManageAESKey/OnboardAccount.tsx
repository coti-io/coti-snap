import React from 'react';
import styled from 'styled-components';

import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';

const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: medium;
  margin: 0;
`;

export const OnboardAccount = () => {
  const { setAESKey } = useSnap();

  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentText>Start with the onboarding of your account</ContentText>
      <Button primary text="Onboard account" onClick={setAESKey} />
    </>
  );
};
