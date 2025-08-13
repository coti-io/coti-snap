import React, { useState, useCallback, useMemo } from 'react';
import { Contract } from 'ethers';
import { normalizeAddress } from '../../utils/normalizeAddress';
import { useTokenOperations, NFTInfo } from '../../hooks/useTokenOperations';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useModal } from '../../hooks/useModal';
import { NFTFormData, NFTFormErrors } from '../../types/token';
import { TOKEN_ID_REGEX, ERROR_MESSAGES } from '../../constants/token';
import { BrowserProvider } from '@coti-io/coti-ethers';
import InfoIcon from '../../assets/info.svg';
import { Tooltip } from '../Tooltip';
import {
  ModalBackdrop,
  AnimatedModalContainer,
  ModalHeader,
  ModalClose,
  LabelRow,
  ModalInput,
  ModalActions,
  ImportTokenContent,
  SendButton
} from './styles';
import { ErrorText } from './components/ErrorText';

interface ImportNFTModalProps {
  open: boolean;
  onClose: () => void;
  provider: BrowserProvider;
  onImport?: () => void;
}

const useImportNFTForm = () => {
  const [formData, setFormData] = useState<NFTFormData>({
    address: '',
    tokenId: '',
    tokenType: 'ERC721'
  });
  
  const [errors, setErrors] = useState<NFTFormErrors>({
    address: '',
    tokenId: '',
    tokenType: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [nftInfoError, setNftInfoError] = useState<string | null>(null);
  const [tokenTypeDetected, setTokenTypeDetected] = useState<'ERC721' | 'ERC1155' | null>(null);

  const updateField = useCallback((field: keyof NFTFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev: NFTFormErrors) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateField = useCallback((field: keyof NFTFormData, value: string): string => {
    switch (field) {
      case 'address':
        if (!value) return '';
        return normalizeAddress(value) ? '' : ERROR_MESSAGES.INVALID_ADDRESS;
      case 'tokenId':
        if (!value) return ERROR_MESSAGES.TOKEN_ID_REQUIRED;
        return TOKEN_ID_REGEX.test(value) ? '' : ERROR_MESSAGES.TOKEN_ID_INVALID;
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: NFTFormErrors = {
      address: validateField('address', formData.address),
      tokenId: validateField('tokenId', formData.tokenId)
    };
    
    setErrors(newErrors);
    return !newErrors.address && !newErrors.tokenId;
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData({ address: '', tokenId: '', tokenType: 'ERC721' });
    setErrors({ address: '', tokenId: '', tokenType: '' });
    setIsLoading(false);
    setTokenTypeDetected(null);
  }, []);

  return {
    formData,
    errors,
    isLoading,
    nftInfo,
    tokenTypeDetected,
    updateField,
    validateField,
    validateForm,
    setIsLoading,
    resetForm,
    setErrors,
    setNftInfo,
    setNftInfoError,
    setTokenTypeDetected
  };
};

export const ImportNFTModal: React.FC<ImportNFTModalProps> = React.memo(({ 
  open, 
  onClose, 
  provider, 
  onImport
}) => {
  const { addNFTToMetaMask, addERC1155ToMetaMask, getNFTInfo } = useTokenOperations(provider);
  const { addToken, hasToken } = useImportedTokens();
  const {
    formData,
    errors,
    isLoading,
    nftInfo,
    updateField,
    validateField,
    validateForm,
    setIsLoading,
    resetForm,
    setErrors,
    setNftInfo,
    setNftInfoError,
    setTokenTypeDetected
  } = useImportNFTForm();
  
  const { handleClose, handleBackdropClick, handleKeyDown } = useModal({
    isOpen: open,
    onClose,
    onReset: resetForm
  });

  const isFormValid = useMemo(() => {
    return formData.address && formData.tokenId && !errors.address && !errors.tokenId;
  }, [formData, errors]);

  const isButtonDisabled = useMemo(() => {
    return !isFormValid || isLoading;
  }, [isFormValid, isLoading]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('address', e.target.value);
  }, [updateField]);

  const handleTokenIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (TOKEN_ID_REGEX.test(value)) {
      updateField('tokenId', value);
    }
  }, [updateField]);


  const detectTokenType = useCallback(async (address: string): Promise<'ERC721' | 'ERC1155'> => {
    const browserProvider = provider;
    const contract = new Contract(address, [
      'function supportsInterface(bytes4 interfaceId) view returns (bool)'
    ], browserProvider);
    
    try {
      const ERC721_INTERFACE = '0x80ac58cd';
      const ERC1155_INTERFACE = '0xd9b67a26';
      
      const [isERC721, isERC1155] = await Promise.all([
        (contract as any).supportsInterface(ERC721_INTERFACE),
        (contract as any).supportsInterface(ERC1155_INTERFACE)
      ]);
      
      if (isERC1155) return 'ERC1155';
      if (isERC721) return 'ERC721';
      return 'ERC721';
    } catch (error) {
      console.warn('Failed to detect token type, defaulting to ERC721:', error);
      return 'ERC721';
    }
  }, [provider]);

  const handleAddressBlur = useCallback(async () => {
    const error = validateField('address', formData.address);
    setErrors((prev: NFTFormErrors) => ({ ...prev, address: error }));
    
    if (!error && formData.address) {
      try {
        setNftInfoError(null);
        
        const detectedType = await detectTokenType(formData.address);
        setTokenTypeDetected(detectedType);
        updateField('tokenType', detectedType);
        
        const info = await getNFTInfo(formData.address);
        setNftInfo(info);
      } catch (error) {
        console.error('Failed to fetch NFT info:', error);
        setNftInfoError('Failed to fetch NFT information from contract');
        setNftInfo(null);
        setTokenTypeDetected(null);
      }
    } else {
      setNftInfo(null);
      setNftInfoError(null);
      setTokenTypeDetected(null);
    }
  }, [formData.address, validateField, setErrors, getNFTInfo, setNftInfo, setNftInfoError, detectTokenType, updateField]);

  const handleTokenIdBlur = useCallback(() => {
    const error = validateField('tokenId', formData.tokenId);
    setErrors((prev: NFTFormErrors) => ({ ...prev, tokenId: error }));
  }, [formData.tokenId, validateField, setErrors]);

  const handleImport = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const tokenKey = `${formData.address}-${formData.tokenId}`;
      if (hasToken(tokenKey)) {
        setErrors(prev => ({ ...prev, address: ERROR_MESSAGES.NFT_ALREADY_IMPORTED }));
        return;
      }

      const nftSymbol = nftInfo?.symbol || (formData.tokenType === 'ERC1155' ? 'ERC1155' : 'NFT');
      const nftName = nftInfo?.name || `${formData.tokenType}`;

      if (formData.tokenType === 'ERC721') {
        await addNFTToMetaMask({ 
          address: formData.address, 
          symbol: nftSymbol, 
          decimals: 0, 
          image: '', 
          tokenId: formData.tokenId 
        });
      } else {
        await addERC1155ToMetaMask({ 
          address: formData.address, 
          symbol: nftSymbol, 
          decimals: 0, 
          image: '',
          tokenId: formData.tokenId
        });
      }

      addToken({
        address: tokenKey,
        name: `${nftName} #${formData.tokenId}`,
        symbol: nftSymbol,
        type: formData.tokenType
      });

      if (onImport) onImport();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to import NFT:', error);
      setErrors(prev => ({ ...prev, address: ERROR_MESSAGES.IMPORT_FAILED }));
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, addNFTToMetaMask, formData, resetForm, onClose, hasToken, addToken, setErrors, onImport, nftInfo]);


  if (!open) return null;

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <AnimatedModalContainer onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown} tabIndex={-1}>
        <ModalHeader>
          Import Token
          <ModalClose 
            onClick={handleClose} 
            aria-label="Close modal"
            type="button"
          >
            ×
          </ModalClose>
        </ModalHeader>
        
        <ImportTokenContent>
          <LabelRow>
            Address{' '}
            <Tooltip text="The contract address of the token. For NFTs on OpenSea, this is under Details as 'Contract Address'. For ERC1155 tokens, this is the main contract address that manages all token IDs.">
              <InfoIcon />
            </Tooltip>
          </LabelRow>
          
          <ModalInput
            placeholder="0x..."
            value={formData.address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            disabled={isLoading}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          <ErrorText 
            message={errors.address}
            className="address-error"
          />
          
          <LabelRow>
            Token ID{' '}
            <Tooltip text="The unique token ID. For ERC721, each ID represents a unique NFT. For ERC1155, multiple copies of the same ID can exist. On OpenSea, this number is under 'Details'.">
              <InfoIcon />
            </Tooltip>
          </LabelRow>
          
          <ModalInput
            placeholder="Enter the token ID"
            value={formData.tokenId}
            onChange={handleTokenIdChange}
            onBlur={handleTokenIdBlur}
            type="number"
            disabled={isLoading}
            aria-describedby={errors.tokenId ? 'tokenid-error' : undefined}
          />
          <ErrorText 
            message={errors.tokenId}
            className="tokenid-error"
          />
          
          <ModalActions>
            <SendButton 
              onClick={handleClose}
              disabled={isLoading}
              backgroundColor="#fff"
              textColor="#1E29F6"
              type="button"
            >
              Cancel
            </SendButton>
            <SendButton 
              onClick={handleImport} 
              disabled={isButtonDisabled}
              type="button"
            >
              {isLoading ? 'Importing...' : 'Import'}
            </SendButton>
          </ModalActions>
        </ImportTokenContent>
      </AnimatedModalContainer>
    </ModalBackdrop>
  );
});

ImportNFTModal.displayName = 'ImportNFTModal'; 