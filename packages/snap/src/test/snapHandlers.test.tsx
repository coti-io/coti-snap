import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';
import { UserInputEventType } from '@metamask/snaps-sdk';

import { TokenViewSelector } from '../types';
import * as snapHandlers from '../index';

const { getStateByChainIdAndAddress, setStateByChainIdAndAddress } = require('../utils/snap');
const { checkChainId, recalculateBalances, hideToken } = require('../utils/token');
const { getSVGfromMetadata } = require('../utils/image');

jest.mock('../utils/token', () => ({
  checkChainId: jest.fn(),
  recalculateBalances: jest.fn(),
  hideToken: jest.fn(),
  importToken: jest.fn(),
  getERC20Details: jest.fn(),
  getERC721Details: jest.fn(),
  checkIfERC20Unique: jest.fn(),
  checkIfERC721Unique: jest.fn(),
  checkERC721Ownership: jest.fn(),
}));

jest.mock('../utils/snap', () => ({
  getStateByChainIdAndAddress: jest.fn(),
  setStateByChainIdAndAddress: jest.fn(),
}));

jest.mock('../utils/image', () => ({
  getSVGfromMetadata: jest.fn(),
}));

jest.mock('../components/WrongChain', () => ({
  WrongChain: () => <Text>Wrong Chain</Text>,
}));

jest.mock('../components/Home', () => ({
  Home: ({ balance, tokenBalances, tokenView, aesKey }: any) => (
    <Box>
      <Heading>Home</Heading>
      <Text>Balance: {balance.toString()}</Text>
      <Text>Tokens: {tokenBalances.length}</Text>
      <Text>View: {tokenView}</Text>
      <Text>AES Key: {aesKey || 'none'}</Text>
    </Box>
  ),
}));

jest.mock('../components/TokenDetails', () => ({
  TokenDetails: ({ token }: any) => (
    <Box>
      <Heading>Token Details</Heading>
      <Text>{token.name}</Text>
    </Box>
  ),
}));

jest.mock('../components/HideToken', () => ({
  HideToken: ({ tokenAddress }: any) => (
    <Box>
      <Heading>Hide Token</Heading>
      <Text>{tokenAddress}</Text>
    </Box>
  ),
}));

declare const global: {
  ethereum: any;
  snap: any;
};

global.ethereum = {
  request: jest.fn(),
};

global.snap = {
  request: jest.fn(),
};

describe('Snap Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onInstall', () => {
    it('should request accounts and initialize state if no balance exists', async () => {
      const mockState = {};
      global.ethereum.request.mockResolvedValue(['0x123']);
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      (setStateByChainIdAndAddress as jest.Mock).mockResolvedValue(undefined);

      await snapHandlers.onInstall({ origin: 'test-origin' });

      expect(global.ethereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
      expect(setStateByChainIdAndAddress).toHaveBeenCalledWith({
        balance: '0',
        tokenBalances: [],
        aesKey: null,
        tokenView: TokenViewSelector.ERC20,
      });
    });

    it('should not initialize state if balance already exists', async () => {
      const mockState = { balance: '100' };
      global.ethereum.request.mockResolvedValue(['0x123']);
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      await snapHandlers.onInstall({ origin: 'test-origin' });

      expect(global.ethereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
      expect(setStateByChainIdAndAddress).not.toHaveBeenCalled();
    });
  });

  describe('onUpdate', () => {
    it('should clear snap state', async () => {
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.onUpdate({ origin: 'test-origin' });

      expect(global.snap.request).toHaveBeenCalledWith({
        method: 'snap_manageState',
        params: {
          operation: 'clear',
        },
      });
    });
  });

  describe('onHomePage', () => {
    it('should return WrongChain component when chain check fails', async () => {
      (checkChainId as jest.Mock).mockResolvedValue(false);

      const result = await snapHandlers.onHomePage();

      expect(result).toHaveProperty('content');
      expect((result as any).content.type).toBe('Text');
    });

    it('should return Home component with balance and tokens when successful', async () => {
      const mockBalance = BigInt(1000);
      const mockTokens = [{ address: '0xToken1', symbol: 'T1' }];
      const mockState = { aesKey: 'test-key' };

      (checkChainId as jest.Mock).mockResolvedValue(true);
      (recalculateBalances as jest.Mock).mockResolvedValue({
        balance: mockBalance,
        tokenBalances: mockTokens,
      });
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      (setStateByChainIdAndAddress as jest.Mock).mockResolvedValue(undefined);

      const result = await snapHandlers.onHomePage();

      expect(checkChainId).toHaveBeenCalled();
      expect(recalculateBalances).toHaveBeenCalled();
      expect(setStateByChainIdAndAddress).toHaveBeenCalledWith({
        ...mockState,
        tokenView: TokenViewSelector.ERC20,
      });
      expect(result).toHaveProperty('content');
      expect((result as any).content.type).toBe('Box');
    });

    it('should return Home with empty state when error occurs', async () => {
      const mockState = { aesKey: null };

      (checkChainId as jest.Mock).mockResolvedValue(true);
      (recalculateBalances as jest.Mock).mockRejectedValue(new Error('Test error'));
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      const result = await snapHandlers.onHomePage();

      expect(result).toHaveProperty('content');
      expect((result as any).content.type).toBe('Box');
    });
  });

  describe('onUserInput', () => {
    const mockEvent = (name: string) => ({
      type: UserInputEventType.ButtonClickEvent,
      name,
    } as any);

    it('should handle token details button click', async () => {
      const mockToken = { address: '0xToken1', name: 'Test Token', uri: null };
      const mockState = { tokenBalances: [mockToken] };
      
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.onUserInput({
        id: 'test-id',
        event: mockEvent('token-details-0xToken1'),
        context: null,
      });

      expect(global.snap.request).toHaveBeenCalledWith({
        method: 'snap_updateInterface',
        params: {
          id: 'test-id',
          ui: expect.objectContaining({
            type: 'Box',
          }),
        },
      });
    });

    it('should handle token details with URI and image', async () => {
      const mockToken = { 
        address: '0xToken1', 
        name: 'Test Token', 
        uri: 'https://example.com/metadata' 
      };
      const mockState = { tokenBalances: [mockToken] };
      
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      (getSVGfromMetadata as jest.Mock).mockResolvedValue('base64image');
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.onUserInput({
        id: 'test-id',
        event: mockEvent('token-details-0xToken1'),
        context: null,
      });

      expect(getSVGfromMetadata).toHaveBeenCalledWith('https://example.com/metadata');
      expect(global.snap.request).toHaveBeenCalled();
    });

    it('should handle confirm hide token button click', async () => {
      const mockToken = { address: '0xToken1', name: 'Test Token' };
      const mockState = { tokenBalances: [mockToken] };
      
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.onUserInput({
        id: 'test-id',
        event: mockEvent('confirm-hide-token-0xToken1'),
        context: null,
      });

      expect(global.snap.request).toHaveBeenCalledWith({
        method: 'snap_updateInterface',
        params: {
          id: 'test-id',
          ui: expect.objectContaining({
            type: 'Box',
          }),
        },
      });
    });

    it('should handle hide token confirmed button click', async () => {
      (hideToken as jest.Mock).mockResolvedValue(undefined);
      (recalculateBalances as jest.Mock).mockResolvedValue({
        balance: BigInt(0),
        tokenBalances: [],
      });
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue({
        balance: '0',
        tokenBalances: [],
        tokenView: TokenViewSelector.ERC20,
        aesKey: null,
      });
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.onUserInput({
        id: 'test-id',
        event: mockEvent('hide-token-confirmed-0xToken1'),
        context: null,
      });

      expect(hideToken).toHaveBeenCalledWith('0xToken1');
      expect(recalculateBalances).toHaveBeenCalled();
    });
  });

  describe('returnToHomePage', () => {
    it('should update interface with Home component', async () => {
      const mockState = {
        balance: '1000',
        tokenBalances: [],
        tokenView: TokenViewSelector.ERC20,
        aesKey: null,
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      global.snap.request.mockResolvedValue(undefined);

      await snapHandlers.returnToHomePage('test-id');

      expect(global.snap.request).toHaveBeenCalledWith({
        method: 'snap_updateInterface',
        params: {
          id: 'test-id',
          ui: expect.objectContaining({
            type: 'Box',
          }),
        },
      });
    });
  });
});