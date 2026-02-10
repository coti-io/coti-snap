import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';

import * as snapHandlers from '..';
import { TokenViewSelector } from '../types';

const {
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
} = require('../utils/snap');
const { checkChainId, recalculateBalances } = require('../utils/token');

jest.mock('../utils/snap', () => ({
  getStateByChainIdAndAddress: jest.fn(),
  setStateByChainIdAndAddress: jest.fn(),
  getExpectedEnvironment: jest.fn(),
  setExpectedEnvironment: jest.fn(),
}));

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

jest.mock('../components/WrongChain', () => ({
  WrongChain: () => <Text>Wrong Chain</Text>,
}));

jest.mock('../components/Home', () => ({
  Home: ({
    balance,
    tokenBalances,
    tokenView,
    aesKey,
  }: {
    balance: bigint;
    tokenBalances: unknown[];
    tokenView: string;
    aesKey: string | null;
  }) => (
    <Box>
      <Heading>Home</Heading>
      <Text>Balance: {balance.toString()}</Text>
      <Text>Tokens: {String(tokenBalances.length)}</Text>
      <Text>View: {tokenView}</Text>
      <Text>AES Key: {aesKey || 'none'}</Text>
    </Box>
  ),
}));

describe('onHomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders WrongChain when the chain ID is incorrect', async () => {
    (checkChainId as jest.Mock).mockResolvedValue(false);

    const result = await snapHandlers.onHomePage();

    expect(result).toHaveProperty('content');
    expect((result as { content: { type: string } }).content.type).toBe('Text');
  });

  it('renders Home with ERC20 view', async () => {
    const mockBalance = BigInt(100);
    const mockTokenBalances: never[] = [];
    const mockState = { aesKey: null, tokenView: TokenViewSelector.ERC20 };

    (checkChainId as jest.Mock).mockResolvedValue(true);
    (recalculateBalances as jest.Mock).mockResolvedValue({
      balance: mockBalance,
      tokenBalances: mockTokenBalances,
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
    expect((result as { content: { type: string } }).content.type).toBe('Box');
  });
});
