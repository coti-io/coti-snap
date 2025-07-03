import { isAddress } from 'ethers';

export const TOKEN_VALIDATION_ERRORS = {
  INVALID_ADDRESS: 'Please enter a valid contract address',
  REQUIRED_ADDRESS: 'Contract address is required',
  INVALID_TOKEN_ID: 'Please enter a valid token ID',
  REQUIRED_TOKEN_ID: 'Token ID is required',
  NETWORK_ERROR: 'Network error. Please try again.',
  TOKEN_NOT_FOUND: 'Token not found at this address',
  ALREADY_IMPORTED: 'This token has already been imported',
} as const;

/**
 * Validates if a string is a valid Ethereum address
 */
export const validateTokenAddress = (address: string): string => {
  if (!address || address.trim() === '') {
    return TOKEN_VALIDATION_ERRORS.REQUIRED_ADDRESS;
  }

  const trimmedAddress = address.trim();
  
  if (!isAddress(trimmedAddress)) {
    return TOKEN_VALIDATION_ERRORS.INVALID_ADDRESS;
  }

  return '';
};

/**
 * Validates token ID for NFTs
 */
export const validateTokenId = (tokenId: string): string => {
  if (!tokenId || tokenId.trim() === '') {
    return TOKEN_VALIDATION_ERRORS.REQUIRED_TOKEN_ID;
  }

  const trimmedId = tokenId.trim();
  
  // Check if it's a valid number (for most NFT standards)
  if (!/^\d+$/.test(trimmedId)) {
    return TOKEN_VALIDATION_ERRORS.INVALID_TOKEN_ID;
  }

  return '';
};

/**
 * Validates a complete token import form
 */
export interface TokenFormData {
  address: string;
  tokenId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    address?: string;
    tokenId?: string;
  };
}

export const validateTokenForm = (data: TokenFormData, isNFT = false): ValidationResult => {
  const errors: ValidationResult['errors'] = {};

  // Validate address
  const addressError = validateTokenAddress(data.address);
  if (addressError) {
    errors.address = addressError;
  }

  // Validate token ID for NFTs
  if (isNFT && data.tokenId !== undefined) {
    const tokenIdError = validateTokenId(data.tokenId);
    if (tokenIdError) {
      errors.tokenId = tokenIdError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Creates a composite address for NFTs (address-tokenId)
 */
export const createNFTCompositeAddress = (contractAddress: string, tokenId: string): string => {
  return `${contractAddress.toLowerCase()}-${tokenId}`;
};

/**
 * Parses a composite NFT address back to its components
 */
export const parseNFTAddress = (compositeAddress: string): { contractAddress: string; tokenId: string } => {
  const parts = compositeAddress.split('-');
  if (parts.length < 2) {
    return {
      contractAddress: compositeAddress,
      tokenId: '',
    };
  }
  
  return {
    contractAddress: parts[0] || '',
    tokenId: parts.slice(1).join('-'), // In case token ID contains hyphens
  };
};

/**
 * Formats an address for display (truncated version)
 */
export const formatAddressForDisplay = (address: string | undefined, startLength = 6, endLength = 4): string => {
  if (!address) return 'Unknown Address';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};