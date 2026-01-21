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
const { getStateByChainIdAndAddress, setStateByChainIdAndAddress, getExpectedEnvironment } = require('../utils/snap');
jest.mock('../utils/snap', () => ({
  getStateByChainIdAndAddress: jest.fn(),
  setStateByChainIdAndAddress: jest.fn(),
  getExpectedEnvironment: jest.fn(),
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
    it('should return true when expectedEnvironment is set to testnet', async () => {
      (getExpectedEnvironment as jest.Mock).mockResolvedValue('testnet');

      const result = await tokenUtils.checkChainId();

      expect(getExpectedEnvironment).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when expectedEnvironment is set to mainnet', async () => {
      (getExpectedEnvironment as jest.Mock).mockResolvedValue('mainnet');

      const result = await tokenUtils.checkChainId();

      expect(getExpectedEnvironment).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when chain ID does not match and no expectedEnvironment', async () => {
      (getExpectedEnvironment as jest.Mock).mockResolvedValue(null);
      global.ethereum.request.mockResolvedValue('0x1'); // Ethereum mainnet

      const result = await tokenUtils.checkChainId();

      expect(result).toBe(false);
    });
  });

  describe('getERC721Details', () => {
    it('should return ERC721 details when valid', async () => {
      const mockContract = {
        symbol: jest.fn().mockResolvedValue('NFTS'),
        name: jest.fn().mockResolvedValue('NFT Collection'),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const details = await tokenUtils.getERC721Details('0xNFTAddress');

      expect(mockContract.symbol).toHaveBeenCalled();
      expect(mockContract.name).toHaveBeenCalled();
      expect(details).toEqual({
        symbol: 'NFTS',
        name: 'NFT Collection',
      });
    });

    it('should return null when an error occurs', async () => {
      const mockContract = {
        symbol: jest.fn().mockRejectedValue(new Error('Error')),
        name: jest.fn(),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const details = await tokenUtils.getERC721Details('0xNFTAddress');

      expect(details).toBeNull();
    });
  });

  describe('checkERC721Ownership', () => {
    it('should return true when user owns the token', async () => {
      const userAddress = '0x123';
      global.ethereum.request.mockResolvedValue([userAddress]);
      const mockContract = {
        ownerOf: jest.fn().mockResolvedValue(userAddress),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const result = await tokenUtils.checkERC721Ownership('0xNFTAddress', '1');

      expect(mockContract.ownerOf).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBe(true);
    });

    it('should return false when user does not own the token', async () => {
      const userAddress = '0x123';
      const ownerAddress = '0x456';
      global.ethereum.request.mockResolvedValue([userAddress]);
      const mockContract = {
        ownerOf: jest.fn().mockResolvedValue(ownerAddress),
      };
      (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

      const result = await tokenUtils.checkERC721Ownership('0xNFTAddress', '1');

      expect(result).toBe(false);
    });

    it('should return false when no account is connected', async () => {
      global.ethereum.request.mockResolvedValue([]);

      const result = await tokenUtils.checkERC721Ownership('0xNFTAddress', '1');

      expect(result).toBe(false);
    });
  });

  describe('checkIfERC20Unique', () => {
    it('should return true when token is unique', async () => {
      const mockState = {
        tokenBalances: [
          { address: '0xOtherToken', type: TokenViewSelector.ERC20 },
        ],
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      const result = await tokenUtils.checkIfERC20Unique('0xNewToken');

      expect(result).toBe(true);
    });

    it('should return false when token already exists', async () => {
      const mockState = {
        tokenBalances: [
          { address: '0xExistingToken', type: TokenViewSelector.ERC20 },
        ],
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      const result = await tokenUtils.checkIfERC20Unique('0xExistingToken');

      expect(result).toBe(false);
    });
  });

  describe('checkIfERC721Unique', () => {
    it('should return true when NFT is unique', async () => {
      const mockState = {
        tokenBalances: [
          { address: '0xNFTAddress', tokenId: '2', type: TokenViewSelector.NFT },
        ],
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      const result = await tokenUtils.checkIfERC721Unique('0xNFTAddress', '1');

      expect(result).toBe(true);
    });

    it('should return false when NFT already exists', async () => {
      const mockState = {
        tokenBalances: [
          { address: '0xNFTAddress', tokenId: '1', type: TokenViewSelector.NFT },
        ],
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      const result = await tokenUtils.checkIfERC721Unique('0xNFTAddress', '1');

      expect(result).toBe(false);
    });
  });

  describe('truncateAddress', () => {
    it('should truncate long addresses', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      
      const result = tokenUtils.truncateAddress(address);
      
      expect(result).toBe('0x1234...345678');
    });

    it('should return original address if short', () => {
      const address = '0x1234';
      
      const result = tokenUtils.truncateAddress(address);
      
      expect(result).toBe('0x1234');
    });

    it('should use custom length', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      
      const result = tokenUtils.truncateAddress(address, 4);
      
      expect(result).toBe('0x12...5678');
    });
  });

  describe('formatTokenBalance', () => {
    it('should return 0 for null balance', () => {
      const result = tokenUtils.formatTokenBalance(null, '18');
      
      expect(result).toBe('0');
    });

    it('should return 0 for zero balance', () => {
      const result = tokenUtils.formatTokenBalance('0', '18');
      
      expect(result).toBe('0');
    });

    it('should return 0 for null decimals', () => {
      const result = tokenUtils.formatTokenBalance('1000', null);
      
      expect(result).toBe('0');
    });

    it('should handle invalid input gracefully', () => {
      const result = tokenUtils.formatTokenBalance('invalid', '18');
      
      expect(result).toBe('0');
    });
  });

  describe('importToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should import valid ERC20 token without errors', async () => {
      const mockState = { tokenBalances: [] };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);
      (setStateByChainIdAndAddress as jest.Mock).mockResolvedValue(undefined);

      // Mock for ERC165 check (will return false for NFT check)
      const mockERC165Contract = {
        supportsInterface: jest.fn().mockResolvedValue(false),
      };

      // Mock for ERC20 standard contract
      const mockERC20Contract = {
        decimals: jest.fn().mockResolvedValue(18),
        symbol: jest.fn().mockResolvedValue('TKN'),
        totalSupply: jest.fn().mockResolvedValue('1000000'),
        balanceOf: jest.fn().mockResolvedValue('1000'),
      };

      // Mock for confidential ERC20 contract (will fail to indicate non-confidential)
      const mockERC20ConfidentialContract = {
        accountEncryptionAddress: undefined,
      };

      (ethers.Contract as jest.Mock)
        .mockImplementationOnce(() => mockERC165Contract)
        .mockImplementationOnce(() => mockERC20Contract)
        .mockImplementationOnce(() => mockERC20ConfidentialContract);

      await expect(tokenUtils.importToken('0xToken', 'Test Token', 'TT', '18')).resolves.not.toThrow();

      expect(setStateByChainIdAndAddress).toHaveBeenCalledWith({
        tokenBalances: [{
          address: '0xToken',
          name: 'Test Token',
          symbol: 'TT',
          balance: null,
          type: TokenViewSelector.ERC20,
          confidential: false,
          decimals: '18',
          tokenId: null,
        }],
      });
    });

    it('should not import unknown token type', async () => {
      const mockState = { tokenBalances: [] };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      // Mock for ERC165 check (will return false for NFT check)
      const mockERC165Contract = {
        supportsInterface: jest.fn().mockResolvedValue(false),
      };

      // Mock for ERC20 contract that will fail (to trigger UNKNOWN type)
      const mockERC20Contract = {
        decimals: jest.fn().mockRejectedValue(new Error('Contract error')),
      };

      (ethers.Contract as jest.Mock)
        .mockImplementationOnce(() => mockERC165Contract)
        .mockImplementationOnce(() => mockERC20Contract);

      await expect(tokenUtils.importToken('0xToken', 'Unknown Token', 'UT', '18')).rejects.toThrow('Invalid token type');

      expect(setStateByChainIdAndAddress).not.toHaveBeenCalled();
    });

    it('should not import NFT without tokenId', async () => {
      const mockState = { tokenBalances: [] };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      // Mock for ERC165 check (will return true for NFT check)
      const mockERC165Contract = {
        supportsInterface: jest.fn().mockResolvedValue(true),
      };

      // Mock for ERC721 confidential contract
      const mockERC721Contract = {
        tokenURI: jest.fn().mockResolvedValue('mockURI'),
      };

      (ethers.Contract as jest.Mock)
        .mockImplementationOnce(() => mockERC165Contract)
        .mockImplementationOnce(() => mockERC721Contract);

      await expect(tokenUtils.importToken('0xNFT', 'NFT Token', 'NFT', '0')).rejects.toThrow('Token ID required for NFT');

      expect(setStateByChainIdAndAddress).not.toHaveBeenCalled();
    });
  });

  describe('hideToken', () => {
    it('should remove token from state', async () => {
      const mockState = {
        tokenBalances: [
          { address: '0xToken1', symbol: 'T1' },
          { address: '0xToken2', symbol: 'T2' },
        ],
      };
      (getStateByChainIdAndAddress as jest.Mock).mockResolvedValue(mockState);

      await tokenUtils.hideToken('0xToken1');

      expect(setStateByChainIdAndAddress).toHaveBeenCalledWith({
        tokenBalances: [{ address: '0xToken2', symbol: 'T2' }],
      });
    });
  });
});
