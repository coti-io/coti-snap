import { useAccount } from 'wagmi';

import { isSupportedChainId } from '../config/networks';

export const useWrongChain = () => {
  const account = useAccount();
  const chainId = account.chain?.id;
  const wrongChain =
    typeof chainId === 'number' ? !isSupportedChainId(chainId) : false;

  return { wrongChain, account };
};
