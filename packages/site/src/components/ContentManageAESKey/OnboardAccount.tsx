import React, { useState, useMemo, useEffect, useCallback, memo, useTransition, useRef } from 'react';
import { useAccount } from 'wagmi';
import styled from 'styled-components';

import { ButtonAction } from '../Button';
import { ContentText, ContentTitle } from '../styles';
import { getNetworkConfig, isSupportedChainId } from '../../config/networks';
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

const FUND_WALLET_URL = 'https://www.binance.com/en/price/coti';

const FundingHelper = styled.div`
  margin-top: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  background: rgba(30, 41, 246, 0.08);
  border: 1px solid rgba(30, 41, 246, 0.2);
`;

const FundingHelperText = styled.span`
  display: block;
  font-size: 1.4rem;
  line-height: 1.4;
  color: #000000 !important;

  strong {
    color: #000000 !important;
  }
`;

const FundingHelperActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;

  & > * {
    flex: 1 1 200px;
    min-width: 160px;
  }
`;

export const OnboardAccount: React.FC<OnboardAccountProps> = memo(() => {
  const { setAESKey, loading, settingAESKeyError } = useSnap();
  const { isConnected, address, chain } = useAccount();
  const { wrongChain } = useWrongChain();
  const { isInstallingSnap } = useMetaMask();
  const isSupportedChain = isSupportedChainId(chain?.id);
  const isTestnetNetwork = Boolean(
    isSupportedChain && getNetworkConfig(chain?.id).isTestnet
  );

  const [, startTransition] = useTransition();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    isCompleted: false
  });
  const [hasCopiedAddress, setHasCopiedAddress] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOnboardingState({
      isOnboarding: false,
      isCompleted: false
    });
    setHasCopiedAddress(false);
  }, [address]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowWizard = useMemo(() => {
    const showWizard =
      onboardingState.isOnboarding &&
      !onboardingState.isCompleted &&
      isTestnetNetwork;
    return showWizard;
  }, [onboardingState, isTestnetNetwork]);

  const handleStartOnboarding = useCallback(async (): Promise<void> => {
    startTransition(() => {
      if (isTestnetNetwork) {
        setOnboardingState(prev => ({
          ...prev,
          isOnboarding: true
        }));
      }
    });

    if (!isTestnetNetwork) {
      try {
        await setAESKey();
        handleOnboardingComplete();
      } catch (error) {
        console.error('OnboardAccount: Error during AES key setup:', error);
      }
    }
  }, [isTestnetNetwork, setAESKey, startTransition]);

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

  const handleFundWalletClick = useCallback((): void => {
    if (typeof window !== 'undefined') {
      window.open(FUND_WALLET_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);

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
    (!isTestnetNetwork && loading && !settingAESKeyError) ? (
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
          disabled={!isTestnetNetwork && loading}
        />

        {!isTestnetNetwork && settingAESKeyError === 'accountBalanceZero' && (
          <>
            <Alert type="error">
              Error onboarding account: Insufficient funds.
            </Alert>
            <FundingHelper>
              <FundingHelperText>
                Add funds to your wallet so you can proceed with onboarding, then click&nbsp;
                <strong>Onboard</strong> again.
              </FundingHelperText>
              <FundingHelperActions>
                <ButtonAction
                  text="Fund wallet"
                  onClick={handleFundWalletClick}
                />
              </FundingHelperActions>
            </FundingHelper>
          </>
        )}
        {!isTestnetNetwork && settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {!isTestnetNetwork && settingAESKeyError === 'userRejected' && (
          <Alert type="error">
            Transaction rejected by user. Please try again when ready.
          </Alert>
        )}
        {!isTestnetNetwork && settingAESKeyError === 'unknownError' && (
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
