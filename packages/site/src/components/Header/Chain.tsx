import React from 'react';

import { useWrongChain } from '../../hooks';
import { ConnectedDetails } from './styles';

export const Chain = () => {
  const { wrongChain, account } = useWrongChain();
  return (
    <ConnectedDetails $wrongChain={wrongChain}>
      {wrongChain ? 'Wrong chain' : account.chain?.name}
    </ConnectedDetails>
  );
};
