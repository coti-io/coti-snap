import { BrowserProvider } from 'ethers';

import {
  getStateData,
  setStateData,
  getStateIdentifier,
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
} from '../utils/snap';
import type { GeneralState, State } from '../types';

jest.mock('ethers');

const mockSnapRequest = jest.fn();

(global as any).snap = {
  request: mockSnapRequest,
};

declare const global: {
  ethereum: any;
};

global.ethereum = {
  request: jest.fn(),
};

describe('Snap State Management Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSnapRequest.mockClear();
    (global.ethereum.request as jest.Mock).mockClear();
  });

  describe('getStateData', () => {
    it('should retrieve state data from snap', async () => {
      const mockState = { chainId: '2033', address: '0x123', balance: '100' };
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

      const result = await getStateData<any>();
      expect(result).toBeNull();
    });
  });

  describe('setStateData', () => {
    it('should update state data in snap', async () => {
      const newState = { chainId: '2033', balance: '200' };
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
        '2033': {
          '0x123': {
            balance: '100',
            tokenBalances: [],
            aesKey: 'test-key',
            tokenView: 'ERC20' as any,
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
    it('should return current chain ID and address', async () => {
      const mockChainId = BigInt(2033);
      const mockAddress = '0x1234567890123456789012345678901234567890';

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: mockChainId,
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);

      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

      const result = await getStateIdentifier();

      expect(result).toEqual({
        chainId: '2033',
        address: mockAddress,
      });
      expect(global.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should throw error when no account is connected', async () => {
      const mockChainId = BigInt(2033);

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: mockChainId,
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);

      (global.ethereum.request as jest.Mock).mockResolvedValue([]);

      await expect(getStateIdentifier()).rejects.toThrow('No account connected');
    });

    it('should handle network errors gracefully', async () => {
      const mockProvider = {
        getNetwork: jest.fn().mockRejectedValue(new Error('Network error')),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);

      await expect(getStateIdentifier()).rejects.toThrow('Network error');
    });
  });

  describe('getStateByChainIdAndAddress', () => {
    it('should return state for current chain and address', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const expectedState: State = {
        balance: '100',
        tokenBalances: [],
        aesKey: 'test-key',
        tokenView: 'ERC20' as any,
      };

      const mockGeneralState: GeneralState = {
        '2033': {
          [mockAddress]: expectedState,
        },
      };

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: BigInt(2033),
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

      mockSnapRequest.mockResolvedValue(mockGeneralState);

      const result = await getStateByChainIdAndAddress();

      expect(result).toEqual(expectedState);
    });

    it('should return empty state for new chain/address combination', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: BigInt(2033),
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

      mockSnapRequest.mockResolvedValue({});

      const result = await getStateByChainIdAndAddress();

      expect(result).toEqual({});
    });

    it('should handle null state gracefully', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: BigInt(2033),
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

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
        tokenView: 'NFT' as any,
      };

      const existingState: GeneralState = {
        '2033': {
          [mockAddress]: {
            balance: '100',
            tokenBalances: [],
            aesKey: 'old-key',
            tokenView: 'ERC20' as any,
          },
        },
      };

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: BigInt(2033),
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

      mockSnapRequest
        .mockResolvedValueOnce(existingState)
        .mockResolvedValueOnce({});

      await setStateByChainIdAndAddress(newState);

      expect(mockSnapRequest).toHaveBeenCalledTimes(2);
      expect(mockSnapRequest).toHaveBeenNthCalledWith(2, {
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            '2033': {
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
        tokenView: 'ERC20' as any,
      };

      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({
          chainId: BigInt(2033),
        }),
      };
      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      (global.ethereum.request as jest.Mock).mockResolvedValue([mockAddress]);

      mockSnapRequest
        .mockResolvedValueOnce({}) 
        .mockResolvedValueOnce({});

      await setStateByChainIdAndAddress(newState);

      expect(mockSnapRequest).toHaveBeenCalledTimes(2);
      expect(mockSnapRequest).toHaveBeenNthCalledWith(2, {
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            '2033': {
              [mockAddress]: newState,
            },
          },
        },
      });
    });
  });
});