import type { Eip1193Provider } from '@coti-io/coti-ethers';
import {
  BrowserProvider,
  ONBOARD_CONTRACT_ADDRESS,
} from '@coti-io/coti-ethers';
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

  const handleOnboard = async () => {
    const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
    const signer = await provider.getSigner();

    console.log('signer >>>', signer);

    await signer.generateOrRecoverAes(
      // The contract address
      '0x24D6c44eaB7aA09A085dDB8cD25c28FFc9917EC9',
    );

    console.log('AES key', signer.getUserOnboardInfo()?.aesKey);
  };
  // this address ""works"" (it doesn't throw an error) but it's not the right one
  // 0x413370ed41FB9EE3aea0B1B91FD336cC0be1Bad6
  // 0x413370ed41FB9EE3aea0B1B91FD336cC0be1Bad6

  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentText>Start with the onboarding of your account</ContentText>
      <Button primary text="Onboard account" onClick={handleOnboard} />
    </>
  );
};
