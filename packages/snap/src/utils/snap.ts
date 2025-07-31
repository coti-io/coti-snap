import type { Json } from '@metamask/snaps-sdk';
import { type SnapsProvider } from '@metamask/snaps-sdk';
import { BrowserProvider } from 'ethers';
import type { GeneralState, State, StateIdentifier } from 'src/types';

declare const snap: SnapsProvider;


/**
 * Retrieves the current state data.
 * @returns A Promise that resolves to the current state data.
 */
export async function getStateData<StateType>(): Promise<StateType> {
  return (await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  })) as unknown as StateType;
}

/**
 * Sets the current state data to the specified data.
 * @param data - The new state data to set.
 */
export async function setStateData<StateType>(data: StateType): Promise<void> {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: data as unknown as Record<string, Json>,
    },
  });
}

export const getStateIdentifier = async (): Promise<StateIdentifier> => {
  const provider = new BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  const signer = await provider.getSigner();

  const signerAddress = await signer.getAddress();
  const chainId = network.chainId.toString();
  return { chainId, address: signerAddress };
};

export const getStateByChainIdAndAddress = async (): Promise<State> => {
  const identifier = await getStateIdentifier();
  const state = (await getStateData<GeneralState>()) || {};
  const { chainId, address } = identifier;
  return state[chainId]?.[address] ?? ({} as State);
};

export const setStateByChainIdAndAddress = async (state: State): Promise<void> => {
  const identifier = await getStateIdentifier();
  const oldState = (await getStateData<GeneralState>()) || {};
  const { chainId, address } = identifier;
  const newState = {
    ...oldState,
    [chainId]: {
      ...oldState[chainId],
      [address]: state,
    },
  };
  await setStateData<GeneralState>(newState);
};
