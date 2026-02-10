import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import {
  ContentButtons,
  ContentInput,
  EditableInput,
  EditableInputContainer,
  Link,
} from './styles';
import {
  COTI_FAUCET_LINK,
  ONBOARD_CONTRACT_GITHUB_LINK,
  getOnboardContractLink,
} from '../../config/onboard';
import { useWrongChain } from '../../hooks';
import { useSnap } from '../../hooks/SnapContext';
import { ButtonAction, ButtonCancel } from '../Button';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { Alert } from '../ContentManageToken/Alert';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
import { LoadingWithProgress } from '../LoadingWithProgress';
import { ContentText, ContentTitle } from '../styles';

const ContentTextSpaced = styled(ContentText)`
  line-height: 1.6;
`;

type OnboardAccountWizardProps = {
  readonly handleOnboardAccount: () => void;
  readonly handleCancelOnboard: () => void;
};

export const OnboardAccountWizard: React.FC<OnboardAccountWizardProps> = ({
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

  const { address, chain } = useAccount();
  const [isEditable, setIsEditable] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contractExplorerLink = useMemo(
    () => getOnboardContractLink(chain?.id),
    [chain?.id],
  );

  useEffect(() => {
    setIsEditable(false);
  }, [address]);

  const handleBlur = (): void => {
    setIsEditable(false);
  };

  const handleCancel = (): void => {
    try {
      snapCancelOnboard();
      handleCancelOnboard();
    } catch (error) {
      void error;
    }
  };

  const handleOnboardClick = async (): Promise<void> => {
    try {
      setIsValidating(true);
      await setAESKey();
    } catch (error) {
      void error;
    } finally {
      setIsValidating(false);
    }
  };

  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();

  if (isConnected && wrongChain) {
    return <ContentSwitchNetwork />;
  }

  return isConnected ? (
    loading ? (
      <LoadingWithProgress title="Onboard" actionText="Onboarding account" />
    ) : (
      <>
        <ContentTitle>Onboard</ContentTitle>
        <ContentTextSpaced>
          You are about to interact with the{' '}
          <Link target="_blank" href={contractExplorerLink}>
            Account Onboard contract
          </Link>{' '}
        </ContentTextSpaced>
        <ContentInput>
          <ContentText id="contract-address-description">
            <Link target="_blank" href={ONBOARD_CONTRACT_GITHUB_LINK}>
              AccountOnboard.sol
            </Link>{' '}
            address
          </ContentText>
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
            text={isValidating ? 'Validating...' : 'Onboard'}
            fullWidth={true}
            onClick={handleOnboardClick}
            disabled={isValidating}
            aria-label="Start onboarding process"
          />
        </ContentButtons>

        {settingAESKeyError === 'accountBalanceZero' && (
          <Alert type="error">
            Error onboarding account: Insufficient funds. Fund your account and
            try again. Testnet funds available at{' '}
            <Link target="_blank" href={COTI_FAUCET_LINK}>
              faucet.coti.io
            </Link>
          </Alert>
        )}
        {settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {settingAESKeyError === 'userRejected' && (
          <Alert type="error">
            Onboarding cancelled: You rejected the transaction request
          </Alert>
        )}
        {settingAESKeyError === 'accountPermissionDenied' && (
          <Alert type="error">
            Permission denied: Please connect your wallet to continue
          </Alert>
        )}
        {settingAESKeyError === 'unknownError' && (
          <Alert type="error">Error to onboard account, try again</Alert>
        )}
      </>
    )
  ) : (
    <ContentConnectYourWallet />
  );
};
