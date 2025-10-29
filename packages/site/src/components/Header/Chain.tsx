import { useSwitchChain } from 'wagmi';
import { useWrongChain } from '../../hooks';
import { ConnectedDetails } from './styles';
import { DEFAULT_CHAIN_ID } from '../../config/wagmi';
import { getNetworkConfig, isSupportedChainId } from '../../config/networks';

export const Chain = () => {
  const { switchChain } = useSwitchChain();
  const { wrongChain, account } = useWrongChain();
  const targetNetwork = getNetworkConfig(DEFAULT_CHAIN_ID);
  const currentNetworkName = isSupportedChainId(account.chain?.id)
    ? getNetworkConfig(account.chain?.id).name
    : account.chain?.name ?? targetNetwork.name;

  const handleSwitchChain = () => {
    switchChain({ chainId: DEFAULT_CHAIN_ID });
  };

  return (
    <ConnectedDetails 
      $wrongChain={wrongChain}
      onClick={wrongChain ? handleSwitchChain : undefined}
      $padding="14px 30px"
    >
      {wrongChain ? 'Wrong chain' : currentNetworkName}
    </ConnectedDetails>
  );
};
