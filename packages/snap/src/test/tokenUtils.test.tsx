import { decryptString, decryptUint } from '@coti-io/coti-sdk-typescript';
import { ethers } from 'ethers';

import { CHAIN_ID } from '../config';
import { TokenViewSelector } from '../types';
import * as tokenUtils from '../utils/token';

jest.mock('ethers');
jest.mock('@coti-io/coti-sdk-typescript', () => ({
  decryptString: jest.fn(),
  decryptUint: jest.fn(),
}));
jest.mock('../utils/snap', () => ({
  getStateByChainIdAndAddress: jest.fn(),
  setStateByChainIdAndAddress: jest.fn(),
}));

declare const global: {
  ethereum: any;
};

global.ethereum = {
  request: jest.fn(),
};

describe('Token Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenURI', () => {
    it('should return decrypted token URI when valid', async () => {
      const mockContract = {
        tokenURI: jest.fn().mockResolvedValue('encryptedURI'),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);
      (decryptString as jest.Mock).mockReturnValue('https://decryptedURI');

      const uri = await tokenUtils.getTokenURI(
        '0xTokenAddress',
        '123',
        'mockAESKey',
      );

      expect(mockContract.tokenURI).toHaveBeenCalledWith(BigInt(123));
      expect(decryptString).toHaveBeenCalledWith('encryptedURI', 'mockAESKey');
      expect(uri).toBe('https://decryptedURI');
    });

    it('should return null when an error occurs', async () => {
      const mockContract = {
        tokenURI: jest.fn().mockRejectedValue(new Error('Error')),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const uri = await tokenUtils.getTokenURI(
        '0xTokenAddress',
        '123',
        'mockAESKey',
      );

      expect(uri).toBeNull();
    });
  });

  describe('getERC20Details', () => {
    it('should return ERC20 details when valid', async () => {
      const mockContract = {
        decimals: jest.fn().mockResolvedValue(18),
        symbol: jest.fn().mockResolvedValue('TKN'),
        name: jest.fn().mockResolvedValue('Token'),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const details = await tokenUtils.getERC20Details('0xTokenAddress');

      expect(mockContract.decimals).toHaveBeenCalled();
      expect(mockContract.symbol).toHaveBeenCalled();
      expect(mockContract.name).toHaveBeenCalled();
      expect(details).toEqual({
        decimals: '18',
        symbol: 'TKN',
        name: 'Token',
      });
    });

    it('should return null when an error occurs', async () => {
      const mockContract = {
        decimals: jest.fn().mockRejectedValue(new Error('Error')),
        symbol: jest.fn(),
        name: jest.fn(),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const details = await tokenUtils.getERC20Details('0xTokenAddress');

      expect(details).toBeNull();
    });
  });

  describe('getTokenType', () => {
    it('should return NFT and confidential when token supports ERC721 interface and has a tokenURI', async () => {
      const mockERC165Contract = {
        supportsInterface: jest.fn().mockResolvedValueOnce(true),
      };
      const mockERC721Contract = {
        tokenURI: jest.fn().mockResolvedValue('mockURI'),
      };
      (ethers.Contract as jest.Mock)
        .mockImplementationOnce(() => mockERC165Contract)
        .mockImplementationOnce(() => mockERC721Contract);

      const type = await tokenUtils.getTokenType('0xTokenAddress');

      expect(type).toEqual({
        type: TokenViewSelector.NFT,
        confidential: true,
      });
    });

    it('should return ERC20 and confidential when accountEncryptionAddress exists', async () => {
      const mockERC20ConfidentialContract = {
        decimals: jest.fn().mockResolvedValue(18),
        symbol: jest.fn().mockResolvedValue('TKN'),
        totalSupply: jest.fn().mockResolvedValue('1000000000000000000'),
        balanceOf: jest.fn().mockResolvedValue('1000'),
        accountEncryptionAddress: jest.fn().mockResolvedValue('mockEncryption'),
      };

      (ethers.Contract as jest.Mock).mockImplementation(
        () => mockERC20ConfidentialContract,
      );

      const type = await tokenUtils.getTokenType('0xTokenAddress');

      expect(type).toEqual({
        type: TokenViewSelector.ERC20,
        confidential: true,
      });
    });

    it('should return UNKNOWN when neither ERC721 nor ERC20 is supported', async () => {
      const mockERC165Contract = {
        supportsInterface: jest.fn().mockResolvedValueOnce(false),
      };
      const mockERC20Contract = {
        decimals: jest.fn().mockRejectedValue(new Error('Error')),
      };
      (ethers.Contract as jest.Mock)
        .mockImplementationOnce(() => mockERC165Contract)
        .mockImplementationOnce(() => mockERC20Contract);

      const type = await tokenUtils.getTokenType('0xTokenAddress');

      expect(type).toEqual({
        type: TokenViewSelector.UNKNOWN,
        confidential: false,
      });
    });
  });

  describe('decryptBalance', () => {
    it('should return decrypted balance when valid', () => {
      (decryptUint as jest.Mock).mockReturnValue(12345);

      const result = tokenUtils.decryptBalance(1337n, 'mockAESKey');

      expect(decryptUint).toHaveBeenCalledWith(1337n, 'mockAESKey');
      expect(result).toBe(12345);
    });

    it('should return null when an error occurs', () => {
      (decryptUint as jest.Mock).mockImplementation(() => {
        throw new Error('Error');
      });

      const result = tokenUtils.decryptBalance(12345n, 'mockAESKey');

      expect(result).toBeNull();
    });
  });

  describe('checkChainId', () => {
    it('should return true when chain ID matches', async () => {
      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({ chainId: CHAIN_ID }),
      };
      (ethers.BrowserProvider as jest.Mock).mockReturnValue(mockProvider);

      const result = await tokenUtils.checkChainId();

      expect(mockProvider.getNetwork).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when chain ID does not match', async () => {
      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({ chainId: 2 }),
      };
      (ethers.BrowserProvider as jest.Mock).mockReturnValue(mockProvider);

      const result = await tokenUtils.checkChainId();

      expect(result).toBe(false);
    });
  });
});
