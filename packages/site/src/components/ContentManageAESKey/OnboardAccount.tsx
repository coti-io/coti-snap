import React, { useState, useMemo, useEffect, useCallback, memo, useTransition } from 'react';
import { useAccount } from 'wagmi';

import { ButtonAction } from '../Button';
import { ContentText, ContentTitle } from '../styles';
import { isLocal } from '../../config/snap';
import { useSnap } from '../../hooks/SnapContext';
import { useWrongChain } from '../../hooks';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
import { Loading } from '../Loading';
import { Alert } from '../ContentManageToken/Alert';
import { OnboardAccountWizard } from './OnboardAccountWizard';

interface OnboardAccountProps {}

interface OnboardingState {
  readonly isOnboarding: boolean;
  readonly isCompleted: boolean;
}

const ONBOARDING_DESCRIPTION = `Start with onboarding your account so that your wallet could interact with private chain data, for example: your balance in a private ERC20 token.`;

export const OnboardAccount: React.FC<OnboardAccountProps> = memo(() => {
  const { setAESKey, loading, settingAESKeyError } = useSnap();
  const { isConnected, address } = useAccount();
  const { wrongChain } = useWrongChain();
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
    const showWizard = onboardingState.isOnboarding && !onboardingState.isCompleted && isLocal();
    return showWizard;
  }, [onboardingState]);

  const handleStartOnboarding = useCallback(async (): Promise<void> => {
    startTransition(() => {
      if (isLocal()) {
        setOnboardingState(prev => ({
          ...prev,
          isOnboarding: true
        }));
      }
    });
    
    if (!isLocal()) {
      try {
        await setAESKey();
        handleOnboardingComplete();
      } catch (error) {
        console.error('OnboardAccount: Error during AES key setup:', error);
      }
    }
  }, [isLocal, setAESKey, startTransition]);

  const handleOnboardingComplete = useCallback((): void => {
    startTransition(() => {
      setOnboardingState({
        isOnboarding: false,
        isCompleted: true
      });
    });
  }, [startTransition]);

  const handleOnboardingCancel = (): void => {
    setOnboardingState({
      isOnboarding: false,
      isCompleted: false
    });
  };

  if (isConnected && wrongChain) {
    return <ContentSwitchNetwork />;
  }

  return isConnected ? (
    (!isLocal() && loading && !settingAESKeyError) ? (
      <Loading title="Onboard account" actionText="Onboarding account" />
    ) : shouldShowWizard ? (
      <OnboardAccountWizard
        handleOnboardAccount={handleOnboardingComplete}
        handleCancelOnboard={handleOnboardingCancel}
      />
    ) : (
      <>
        <ContentTitle>Onboard Account</ContentTitle>
        <ContentText>
          {ONBOARDING_DESCRIPTION}
        </ContentText>
        <ButtonAction
          primary
          text="Onboard Account"
          onClick={handleStartOnboarding}
          aria-label="Start account onboarding process"
          disabled={!isLocal() && loading}
        />
        
        {!isLocal() && settingAESKeyError === 'accountBalanceZero' && (
          <Alert type="error">
            Error onboarding account: Insufficient funds.
          </Alert>
        )}
        {!isLocal() && settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {!isLocal() && settingAESKeyError === 'userRejected' && (
          <Alert type="error">
            Transaction rejected by user. Please try again when ready.
          </Alert>
        )}
        {!isLocal() && settingAESKeyError === 'unknownError' && (
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
