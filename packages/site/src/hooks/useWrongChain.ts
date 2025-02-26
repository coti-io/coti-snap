import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { CHAIN_ID } from '../config/wagmi';

export const useWrongChain = () => {
  const account = useAccount();
  const [wrongChain, setWrongChain] = useState<boolean>(false);
  const chainId = CHAIN_ID;

  useEffect(() => {
    if (account.chain?.id === chainId) {
      setWrongChain(false);
    } else {
      setWrongChain(true);
    }
  }, [account, chainId]);

  return { wrongChain, account };
};
