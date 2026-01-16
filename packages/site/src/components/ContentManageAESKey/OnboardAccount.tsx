import React, { useMemo, useCallback, memo } from 'react';
import { useAccount } from 'wagmi';
import styled from 'styled-components';

import { ButtonAction } from '../Button';
import { ContentText, ContentTitle } from '../styles';
import { getNetworkConfig, isSupportedChainId } from '../../config/networks';
import { getOnboardContractLink, ONBOARD_CONTRACT_GITHUB_LINK } from '../../config/onboard';
import { useSnap } from '../../hooks/SnapContext';
import { useWrongChain, useMetaMask } from '../../hooks';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
import { LoadingWithProgress } from '../LoadingWithProgress';
import { LoadingWithProgressAlt } from '../LoadingWithProgressAlt';
import { Alert } from '../ContentManageToken/Alert';
import { Link } from './styles';

interface OnboardAccountProps { }

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

const ContractInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #F0F1FE !important;
  border: 1px solid #1E29F6;
  border-radius: 12px;
  margin: 16px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #1E29F6 0%, #6366F1 100%);
  }
`;

const ContractHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
`;

const ContractIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #1E29F6 !important;
  border-radius: 8px;
  font-size: 1.4rem;
`;

const ContractLabel = styled.span`
  font-size: 1.3rem;
  color: #1E29F6 !important;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const ContractAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF !important;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #1E29F6;
  transition: all 0.2s ease;
  margin-left: 8px;

  &:hover {
    box-shadow: 0 2px 8px rgba(30, 41, 246, 0.15);
  }
`;

const ContractAddress = styled.span`
  font-size: 1.15rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #000000 !important;
  word-break: break-all;
  flex: 1;
  line-height: 1.4;
`;

const ViewContractLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  color: #1E29F6 !important;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: #E8E9FD !important;

  &:hover {
    background: #D0D3FC !important;
    text-decoration: none;
  }
`;

const ArrowIcon = styled.span`
  font-size: 1.4rem;
`;

export const OnboardAccount: React.FC<OnboardAccountProps> = memo(() => {
  const {
    setAESKey,
    loading,
    settingAESKeyError,
    onboardContractAddress,
  } = useSnap();
  const { isConnected, chain } = useAccount();
  const { wrongChain } = useWrongChain();
  const { isInstallingSnap } = useMetaMask();
  const isSupportedChain = isSupportedChainId(chain?.id);
  const isTestnetNetwork = Boolean(
    isSupportedChain && getNetworkConfig(chain?.id).isTestnet
  );

  const contractExplorerLink = useMemo(
    () => getOnboardContractLink(chain?.id),
    [chain?.id],
  );

  const handleStartOnboarding = useCallback(async (): Promise<void> => {
    try {
      await setAESKey();
    } catch (error) {
      void error;
    }
  }, [setAESKey]);

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
    (loading && !settingAESKeyError) ? (
      <LoadingWithProgress title="Onboard" actionText="Onboarding account" />
    ) : (
      <>
        <ContentTitle>Onboard</ContentTitle>
        <ContentText>
          {ONBOARDING_DESCRIPTION}
        </ContentText>
        <ContractInfo>
          <ContractHeader>
            <ContractLabel>
              <Link target="_blank" href={ONBOARD_CONTRACT_GITHUB_LINK}>AccountOnboard.sol</Link>
            </ContractLabel>
          </ContractHeader>
          <ContractAddressWrapper>
            <ContractAddress>
              {onboardContractAddress}
            </ContractAddress>
            <ViewContractLink target="_blank" href={contractExplorerLink}>
              View ↗
            </ViewContractLink>
          </ContractAddressWrapper>
        </ContractInfo>
        <ButtonAction
          primary
          text="Onboard"
          iconRight={<ArrowIcon>→</ArrowIcon>}
          onClick={handleStartOnboarding}
          aria-label="Start account onboarding process"
          disabled={loading}
        />

        {settingAESKeyError === 'accountBalanceZero' && (
          <>
            <Alert type="error">
              Error onboarding account: Insufficient funds.
            </Alert>
            {!isTestnetNetwork && (
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
            )}
          </>
        )}
        {settingAESKeyError === 'invalidAddress' && (
          <Alert type="error">
            Error to onboard account, check the contract address
          </Alert>
        )}
        {settingAESKeyError === 'userRejected' && (
          <Alert type="error">
            Transaction rejected by user. Please try again when ready.
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
});

OnboardAccount.displayName = 'OnboardAccount';
