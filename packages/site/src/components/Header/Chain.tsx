import { useSwitchChain } from 'wagmi';
import { useWrongChain } from '../../hooks';
import { ConnectedDetails } from './styles';
import { CHAIN_ID } from '../../config/wagmi';

export const Chain = () => {
  const { switchChain } = useSwitchChain();
  const { wrongChain, account } = useWrongChain();
  
  const handleSwitchChain = () => {
    switchChain({ chainId: CHAIN_ID });
  };
  
  return (
    <ConnectedDetails 
      $wrongChain={wrongChain}
      onClick={wrongChain ? handleSwitchChain : undefined}
    >
      {wrongChain ? 'Wrong chain' : account.chain?.name}
    </ConnectedDetails>
  );
};
