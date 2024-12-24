import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const useWrongChain = () => {
  const account = useAccount();
  const [wrongChain, setWrongChain] = useState<boolean>(false);
  const chainId = 13068200;

  useEffect(() => {
    if (account.chain?.id === chainId) {
      setWrongChain(false);
    } else {
      setWrongChain(true);
    }
  }, [account, chainId]);

  return { wrongChain, account };
};
