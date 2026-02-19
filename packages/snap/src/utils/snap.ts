import type { Json, SnapsProvider } from '@metamask/snaps-sdk';
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

export const getStateIdentifier = async (
  options: { requestAccounts?: boolean } = {},
): Promise<StateIdentifier> => {
  const accounts = (await ethereum.request({
    method: 'eth_accounts',
  })) as string[];
  let currentAddress = accounts.length > 0 ? accounts[0] : null;

  if (!currentAddress && options.requestAccounts) {
    try {
      const requested = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      currentAddress = requested.length > 0 ? requested[0] : null;
    } catch (error) {
      void error;
    }
  }

  if (!currentAddress) {
    throw new Error('No account connected');
  }

  const expectedEnv = await getExpectedEnvironment();

  let chainId: string;
  if (expectedEnv) {
    chainId = expectedEnv === 'testnet' ? '7082400' : '2632500';
  } else {
    const chainIdHex = (await ethereum.request({
      method: 'eth_chainId',
    })) as string;
    chainId = parseInt(chainIdHex, 16).toString();
  }

  return { chainId, address: currentAddress };
};

export const getStateByChainIdAndAddress = async (
  overrideChainId?: string | null,
  requestAccounts = false,
): Promise<State> => {
  const identifier = await getStateIdentifier({ requestAccounts });
  const state = (await getStateData<GeneralState>()) || {};
  const chainId = overrideChainId ?? identifier.chainId;
  const { address } = identifier;
  const result = state[chainId]?.[address] ?? ({} as State);
  return result;
};

export const setStateByChainIdAndAddress = async (
  state: State,
  overrideChainId?: string | null,
  requestAccounts = false,
): Promise<void> => {
  const identifier = await getStateIdentifier({ requestAccounts });
  const oldState = (await getStateData<GeneralState>()) || {};
  const chainId = overrideChainId ?? identifier.chainId;
  const { address } = identifier;
  const newState = {
    ...oldState,
    [chainId]: {
      ...oldState[chainId],
      [address]: state,
    },
  };
  await setStateData<GeneralState>(newState);
};

type GlobalSettings = {
  expectedEnvironment?: 'testnet' | 'mainnet' | null;
};

const GLOBAL_SETTINGS_KEY = '__global_settings__';

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  const state = (await getStateData<Record<string, unknown>>()) || {};
  return (state[GLOBAL_SETTINGS_KEY] as GlobalSettings) || {};
};

export const setGlobalSettings = async (
  settings: GlobalSettings,
): Promise<void> => {
  const state = (await getStateData<Record<string, unknown>>()) || {};
  await setStateData({
    ...state,
    [GLOBAL_SETTINGS_KEY]: settings,
  });
};

export const setExpectedEnvironment = async (
  environment: 'testnet' | 'mainnet',
): Promise<void> => {
  const settings = await getGlobalSettings();
  await setGlobalSettings({
    ...settings,
    expectedEnvironment: environment,
  });
};

export const getExpectedEnvironment = async (): Promise<
  'testnet' | 'mainnet' | null
> => {
  const settings = await getGlobalSettings();
  return settings.expectedEnvironment ?? null;
};
