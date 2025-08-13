import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import styled from 'styled-components';

import EditIcon from '../../assets/edit.svg';
import { COTI_FAUCET_LINK, ONBOARD_CONTRACT_LINK } from '../../config/onboard';
import { useWrongChain } from '../../hooks';
import { useSnap } from '../../hooks/SnapContext';
import { ButtonAction, ButtonCancel } from '../Button';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import { Alert } from '../ContentManageToken/Alert';
import {
  ContentButtons,
  ContentInput,
  Edit,
  EditableInput,
  EditableInputContainer,
  Link,
} from './styles';

const ContentTextSpaced = styled(ContentText)`
  line-height: 1.6;
`;

interface OnboardAccountWizardProps {
  readonly handleOnboardAccount: () => void;
  readonly handleCancelOnboard: () => void;
}

export const OnboardAccountWizard: React.FC<OnboardAccountWizardProps> = ({
  handleOnboardAccount,
  handleCancelOnboard,
}) => {
  const {
    setAESKey,
    loading,
    settingAESKeyError,
    onboardContractAddress,
    handleOnChangeContactAddress,
    handleCancelOnboard: snapCancelOnboard,
  } = useSnap();

  const [isEditable, setIsEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = (): void => {
    setIsEditable(true);
    // Focus the input after making it editable
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleBlur = (): void => {
    setIsEditable(false);
  };

  const handleCancel = (): void => {
    try {
      snapCancelOnboard();
      handleCancelOnboard();
    } catch (error) {
      console.error('Error during onboarding cancellation:', error);
    }
  };

  const handleOnboardClick = async (): Promise<void> => {
    try {
      await setAESKey();
    } catch (error) {
      console.error('Error during AES key setup:', error);
    }
  };

  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();

  if (isConnected && wrongChain) {
    return <ContentSwitchNetwork />;
  }

  return isConnected ? (
    loading ? (
      <Loading title="Onboard account" actionText="Onboarding account" />
    ) : (
      <>
        <ContentTitle>Onboard account</ContentTitle>
        <ContentTextSpaced>
          You are about to interact with the{' '}
          <Link target="_blank" href={ONBOARD_CONTRACT_LINK}>
            AccountOnboard.sol
          </Link>{' '}
          contract.
        </ContentTextSpaced>
        <ContentInput>
          <ContentText id="contract-address-description">AccountOnboard.sol address</ContentText>
          <EditableInputContainer
            $isEditable={isEditable}
            $isError={settingAESKeyError}
          >
            <EditableInput
              ref={inputRef}
              type="text"
              value={onboardContractAddress}
              $isEditable={isEditable}
              readOnly={!isEditable}
              onChange={(e) => handleOnChangeContactAddress(e)}
              onBlur={handleBlur}
              aria-label="AccountOnboard contract address"
              aria-describedby="contract-address-description"
            />
            <Edit
              onClick={handleIconClick}
              aria-label="Edit contract address"
              title="Click to edit contract address"
            >
              <EditIcon />
            </Edit>
          </EditableInputContainer>
        </ContentInput>
        <ContentButtons>
          <ButtonCancel
            text="Cancel"
            fullWidth={true}
            onClick={handleCancel}
            aria-label="Cancel onboarding"
          />
          <ButtonAction
            primary
            text="Onboard"
            fullWidth={true}
            onClick={handleOnboardClick}
            aria-label="Start onboarding process"
          />
        </ContentButtons>

        {settingAESKeyError === 'accountBalanceZero' && (
          <Alert type="error">
            Error onboarding account: Insufficient funds. Fund your account and
            try again. Testnet funds available at{' '}
            <Link target="_blank" href={COTI_FAUCET_LINK}>
              https://faucet.coti.io
            </Link>
          </Alert>
        )}
        {settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {settingAESKeyError === 'unknownError' && (
          <Alert type="error">
            Error to onboard account, try again
          </Alert>
        )}
      </>
    )
  ) : (
    <ContentConnectYourWallet />
  );
};
