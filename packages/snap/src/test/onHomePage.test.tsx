import { installSnap } from '@metamask/snaps-jest';

import { Home } from '../components/Home';
import { WrongChain } from '../components/WrongChain';
import { CHAIN_ID } from '../config';
import { TokenViewSelector } from '../types';

jest.mock('../utils/snap');
jest.mock('../utils/token', () => ({
  checkChainId: jest.fn(),
}));

describe('onHomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders WrongChain when the chain ID is incorrect', async () => {
    const { onHomePage, mockJsonRpc } = await installSnap();
    mockJsonRpc({
      method: 'eth_chainId',
      result: `0x1`,
    });

    const response = (await onHomePage()) as { response: { result: string } };
    expect(response.response.result).toRender(<WrongChain />);
  });

  it('renders Home with ERC20 view', async () => {
    const { onHomePage, mockJsonRpc } = await installSnap();

    mockJsonRpc({
      method: 'eth_chainId',
      result: `0x${parseInt(CHAIN_ID, 10).toString(16)}`,
    });
    mockJsonRpc({
      method: 'eth_getBalance',
      result: `0x${parseInt('100', 10).toString(16)}`,
    });
    const response = (await onHomePage()) as { response: { result: string } };
    const { result } = response.response;

    expect(result).toRender(
      Home({
        balance: 100n,
        tokenBalances: [],
        tokenView: TokenViewSelector.ERC20,
        aesKey: null,
      }),
    );
  });
});
