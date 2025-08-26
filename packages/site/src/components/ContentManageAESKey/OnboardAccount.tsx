import React, { useState, useMemo, useEffect, useCallback, memo, useTransition } from 'react';
import { useAccount } from 'wagmi';

import { ButtonAction } from '../Button';
import { ContentText, ContentTitle } from '../styles';
import { isTestnet } from '../../config/snap';
import { useSnap } from '../../hooks/SnapContext';
import { useWrongChain, useMetaMask } from '../../hooks';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
import { LoadingWithProgress } from '../LoadingWithProgress';
import { LoadingWithProgressAlt } from '../LoadingWithProgressAlt';
import { Alert } from '../ContentManageToken/Alert';
import { OnboardAccountWizard } from './OnboardAccountWizard';

interface OnboardAccountProps { }

interface OnboardingState {
  readonly isOnboarding: boolean;
  readonly isCompleted: boolean;
}

const ONBOARDING_DESCRIPTION = `Onboarding your account will securely store your network key within the metamask to be used with secured dApp interactions.
For example: viewing your balance on a Private ERC20 token.`;

export const OnboardAccount: React.FC<OnboardAccountProps> = memo(() => {
  const { setAESKey, loading, settingAESKeyError } = useSnap();
  const { isConnected, address } = useAccount();
  const { wrongChain } = useWrongChain();
  const { isInstallingSnap } = useMetaMask();

  const [, startTransition] = useTransition();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    isCompleted: false
  });

  useEffect(() => {
    setOnboardingState({
      isOnboarding: false,
      isCompleted: false
    });
  }, [address]);

  const shouldShowWizard = useMemo(() => {
    const showWizard = onboardingState.isOnboarding && !onboardingState.isCompleted && isTestnet();
    return showWizard;
  }, [onboardingState]);

  const handleStartOnboarding = useCallback(async (): Promise<void> => {
    startTransition(() => {
      if (isTestnet()) {
        setOnboardingState(prev => ({
          ...prev,
          isOnboarding: true
        }));
      }
    });

    if (!isTestnet()) {
      try {
        await setAESKey();
        handleOnboardingComplete();
      } catch (error) {
        console.error('OnboardAccount: Error during AES key setup:', error);
      }
    }
  }, [isTestnet, setAESKey, startTransition]);

  const handleOnboardingComplete = useCallback((): void => {
    setOnboardingState({
      isOnboarding: false,
      isCompleted: true
    });
  }, []);

  const handleOnboardingCancel = (): void => {
    setOnboardingState({
      isOnboarding: false,
      isCompleted: false
    });
  };

  if (isConnected && wrongChain) {
    return <ContentSwitchNetwork />;
  }

  if (isInstallingSnap) {
    return (
      <LoadingWithProgressAlt
        title="Installing"
        actionText=""
      />
    );
  }

  return isConnected ? (
    (!isTestnet() && loading && !settingAESKeyError) ? (
      <LoadingWithProgress title="Onboard" actionText="Onboarding account" />
    ) : shouldShowWizard ? (
      <OnboardAccountWizard
        handleOnboardAccount={handleOnboardingComplete}
        handleCancelOnboard={handleOnboardingCancel}
      />
    ) : (
      <>
        <ContentTitle>Onboard</ContentTitle>
        <ContentText>
          {ONBOARDING_DESCRIPTION}
        </ContentText>
        <ButtonAction
          primary
          text="Onboard"
          onClick={handleStartOnboarding}
          aria-label="Start account onboarding process"
          disabled={!isTestnet() && loading}
        />

        {!isTestnet() && settingAESKeyError === 'accountBalanceZero' && (
          <Alert type="error">
            Error onboarding account: Insufficient funds.
          </Alert>
        )}
        {!isTestnet() && settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {!isTestnet() && settingAESKeyError === 'userRejected' && (
          <Alert type="error">
            Transaction rejected by user. Please try again when ready.
          </Alert>
        )}
        {!isTestnet() && settingAESKeyError === 'unknownError' && (
          <Alert type="error">
            Error to onboard account, try again
          </Alert>
        )}
      </>
    )
  ) : (
    <ContentConnectYourWallet />
  );
});

OnboardAccount.displayName = 'OnboardAccount';
