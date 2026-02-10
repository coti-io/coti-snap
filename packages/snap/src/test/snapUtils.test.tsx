import type { GeneralState, State } from '../types';
import {
  getStateData,
  setStateData,
  getStateIdentifier,
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
} from '../utils/snap';

const mockSnapRequest = jest.fn();

(global as unknown as { snap: { request: jest.Mock } }).snap = {
  request: mockSnapRequest,
};

declare const global: {
  ethereum: {
    request: jest.Mock;
  };
};

global.ethereum = {
  request: jest.fn(),
};

describe('Snap State Management Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSnapRequest.mockClear();
    global.ethereum.request.mockClear();
  });

  describe('getStateData', () => {
    it('should retrieve state data from snap', async () => {
      const mockState = {
        chainId: '7082400',
        address: '0x123',
        balance: '100',
      };
      mockSnapRequest.mockResolvedValue(mockState);

      const result = await getStateData<typeof mockState>();

      expect(mockSnapRequest).toHaveBeenCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'get',
        },
      });
      expect(result).toEqual(mockState);
    });

    it('should handle empty state', async () => {
      mockSnapRequest.mockResolvedValue(null);

      const result = await getStateData<unknown>();
      expect(result).toBeNull();
    });
  });

  describe('setStateData', () => {
    it('should update state data in snap', async () => {
      const newState = { chainId: '7082400', balance: '200' };
      mockSnapRequest.mockResolvedValue({});

      await setStateData(newState);

      expect(mockSnapRequest).toHaveBeenCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState,
        },
      });
    });

    it('should handle complex state objects', async () => {
      const complexState: GeneralState = {
        '7082400': {
          '0x123': {
            balance: '100',
            tokenBalances: [],
            aesKey: 'test-key',
            tokenView:
              'ERC20' as unknown as import('../types').TokenViewSelector,
          },
        },
      };
      mockSnapRequest.mockResolvedValue({});

      await setStateData(complexState);

      expect(mockSnapRequest).toHaveBeenCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: complexState,
        },
      });
    });
  });

  describe('getStateIdentifier', () => {
    it('should return current chain ID and address using expectedEnvironment', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      // Mock eth_accounts
      global.ethereum.request.mockResolvedValue([mockAddress]);

      // Mock getExpectedEnvironment (returns state with expectedEnvironment)
      mockSnapRequest.mockResolvedValue({
        __global_settings__: { expectedEnvironment: 'testnet' },
      });

      const result = await getStateIdentifier();

      expect(result).toEqual({
        chainId: '7082400', // testnet chainId
        address: mockAddress,
      });
      expect(global.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should return chain ID from eth_chainId when no expectedEnvironment', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      // Mock eth_accounts and eth_chainId
      global.ethereum.request
        .mockResolvedValueOnce([mockAddress]) // eth_accounts
        .mockResolvedValueOnce('0x6c11a0'); // eth_chainId (7082400 in hex)

      // Mock getExpectedEnvironment (returns state without expectedEnvironment)
      mockSnapRequest.mockResolvedValue({});

      const result = await getStateIdentifier();

      expect(result).toEqual({
        chainId: '7082400',
        address: mockAddress,
      });
    });

    it('should throw error when no account is connected', async () => {
      global.ethereum.request.mockResolvedValue([]);

      await expect(getStateIdentifier()).rejects.toThrow(
        'No account connected',
      );
    });
  });

  describe('getStateByChainIdAndAddress', () => {
    it('should return state for current chain and address', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const expectedState: State = {
        balance: '100',
        tokenBalances: [],
        aesKey: 'test-key',
        tokenView: 'ERC20' as unknown as import('../types').TokenViewSelector,
      };

      const mockGeneralState = {
        __global_settings__: { expectedEnvironment: 'testnet' },
        '7082400': {
          [mockAddress]: expectedState,
        },
      };

      global.ethereum.request.mockResolvedValue([mockAddress]);
      mockSnapRequest.mockResolvedValue(mockGeneralState);

      const result = await getStateByChainIdAndAddress();

      expect(result).toEqual(expectedState);
    });

    it('should return empty state for new chain/address combination', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      global.ethereum.request.mockResolvedValue([mockAddress]);
      mockSnapRequest.mockResolvedValue({
        __global_settings__: { expectedEnvironment: 'testnet' },
      });

      const result = await getStateByChainIdAndAddress();

      expect(result).toEqual({});
    });

    it('should handle null state gracefully', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      global.ethereum.request
        .mockResolvedValueOnce([mockAddress])
        .mockResolvedValueOnce('0x6c11a0'); // eth_chainId fallback

      mockSnapRequest.mockResolvedValue(null);

      const result = await getStateByChainIdAndAddress();

      expect(result).toEqual({});
    });
  });

  describe('setStateByChainIdAndAddress', () => {
    it('should update state for current chain and address', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const newState: State = {
        balance: '200',
        tokenBalances: [],
        aesKey: 'new-key',
        tokenView: 'NFT' as unknown as import('../types').TokenViewSelector,
      };

      const existingState = {
        __global_settings__: { expectedEnvironment: 'testnet' },
        '7082400': {
          [mockAddress]: {
            balance: '100',
            tokenBalances: [],
            aesKey: 'old-key',
            tokenView: 'ERC20',
          },
        },
      };

      global.ethereum.request.mockResolvedValue([mockAddress]);

      mockSnapRequest
        .mockResolvedValueOnce(existingState) // getExpectedEnvironment
        .mockResolvedValueOnce(existingState) // getStateData
        .mockResolvedValueOnce({}); // setStateData

      await setStateByChainIdAndAddress(newState);

      // Should have called snap.request 3 times
      expect(mockSnapRequest).toHaveBeenCalledTimes(3);
      expect(mockSnapRequest).toHaveBeenLastCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            __global_settings__: { expectedEnvironment: 'testnet' },
            '7082400': {
              [mockAddress]: newState,
            },
          },
        },
      });
    });

    it('should create new chain/address entry if not exists', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const newState: State = {
        balance: '100',
        tokenBalances: [],
        aesKey: 'test-key',
        tokenView: 'ERC20' as unknown as import('../types').TokenViewSelector,
      };

      const existingState = {
        __global_settings__: { expectedEnvironment: 'testnet' },
      };

      global.ethereum.request.mockResolvedValue([mockAddress]);

      mockSnapRequest
        .mockResolvedValueOnce(existingState) // getExpectedEnvironment
        .mockResolvedValueOnce(existingState) // getStateData
        .mockResolvedValueOnce({}); // setStateData

      await setStateByChainIdAndAddress(newState);

      expect(mockSnapRequest).toHaveBeenCalledTimes(3);
      expect(mockSnapRequest).toHaveBeenLastCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            __global_settings__: { expectedEnvironment: 'testnet' },
            '7082400': {
              [mockAddress]: newState,
            },
          },
        },
      });
    });
  });
});
