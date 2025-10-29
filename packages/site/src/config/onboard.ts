import { ONBOARD_CONTRACT_ADDRESS } from '@coti-io/coti-ethers';

import { getNetworkConfig, isSupportedChainId } from './networks';

export const USED_ONBOARD_CONTRACT_ADDRESS =
  ONBOARD_CONTRACT_ADDRESS as `0x${string}`;

const ONBOARD_CONTRACT_EXPLORER_SUFFIX =
  `/address/${USED_ONBOARD_CONTRACT_ADDRESS}?tab=transactions`;

export const getOnboardContractLink = (
  chainId?: number | null,
): string => {
  const resolvedChainId = isSupportedChainId(chainId) ? chainId : undefined;
  const { explorerUrl } = getNetworkConfig(resolvedChainId);
  return `${explorerUrl}${ONBOARD_CONTRACT_EXPLORER_SUFFIX}`;
};

export const COTI_FAUCET_LINK = 'https://faucet.coti.io';

export const ONBOARD_CONTRACT_GITHUB_LINK =
  'https://github.com/coti-io/coti-contracts/blob/main/contracts/onboard/AccountOnboard.sol';

export const COTI_SITE = 'https://coti.io';
