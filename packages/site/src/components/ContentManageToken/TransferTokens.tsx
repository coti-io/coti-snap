import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ContentTitle } from '../styles';
import { IconButton, SendButton, TransferContainer } from './styles';
import {
  HeaderBar,
  TokenInfo,
  TokenName,
  TokenLogos,
  TokenLogoBig,
  TokenLogoSmall,
  SendAmount
} from './styles';
import { Alert } from './Alert';
import {
  SectionTitle,
  AccountBox,
  AccountDetails,
  AccountAddress,
  InputBox,
  AddressInput,
  AmountInput,
  BottomActions,
  HeaderBarSlotLeft,
  HeaderBarSlotTitle,
  HeaderBarSlotRight,
  BalanceRow,
  BalanceSubTransfer,
  MaxButton,
  TokenRowFlex,
  ArrowDownStyled,
  ClearIconButton,
  TokenModalBackdrop,
  TokenModalContainer,
  TokenModalHeader,
  TokenModalClose,
  TokenTabs,
  TokenTab,
  TokenSearchBox,
  TokenSearchInput,
  TokenList,
  TokenListItemBar,
  TokenListItem,
  TokenListInfo,
  TokenListName,
  TokenListSymbol,
  TokenListAmount,
  TokenListValue,
  NoNFTsWrapper,
  NoNFTsText,
  LearnMoreLink
} from './styles/transfer';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import { useMetaMaskContext } from '../../hooks/MetamaskContext';
import { normalizeAddress } from '../../utils/normalizeAddress';
import { truncateString } from '../../utils';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useSnap } from '../../hooks/SnapContext';
import { JazziconComponent } from '../common';
import { TokenId } from './components/TokenId';
import { ErrorText } from './components/ErrorText';
import ArrowBack from '../../assets/arrow-back.svg';
import XIcon from '../../assets/x.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { CotiLogo } from '../../assets/icons';

interface TransferTokensProps {
  onBack: () => void;
  address: string;
  balance: string;
  aesKey?: string | null | undefined;
  initialToken?: any;
}

interface Token {
  symbol: string;
  name: string;
  amount: string;
  usd: number;
  address?: string;
  contractAddress?: string;
  tokenId?: string;
  type?: 'ERC20' | 'ERC721' | 'ERC1155';
}

type AddressStatus = 'idle' | 'loading' | 'error';
type TokenTab = 'tokens' | 'nfts';
type TransactionStatus = 'idle' | 'loading' | 'success' | 'error';

const ADDRESS_VALIDATION_DELAY = 800;

const validateAddress = (address: string): boolean => {
  const normalized = normalizeAddress(address);
  return !!normalized;
};

const parseAmount = (amount: string): number => {
  return parseFloat(amount) || 0;
};

const useAddressValidation = () => {
  const [status, setStatus] = useState<AddressStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isValid, setIsValid] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const validate = useCallback((address: string) => {
    if (!address) {
      setStatus('idle');
      setErrorMsg('');
      setIsValid(false);
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setIsValid(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (validateAddress(address)) {
        setStatus('idle');
        setErrorMsg('');
        setIsValid(true);
      } else {
        setStatus('error');
        setErrorMsg('Invalid address');
        setIsValid(false);
      }
    }, ADDRESS_VALIDATION_DELAY);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMsg('');
    setIsValid(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { status, errorMsg, isValid, validate, reset };
};

const TokenBalanceDisplay: React.FC<{
  token: Token;
  getTokenBalance: (token: Token) => Promise<string>;
}> = React.memo(({ token, getTokenBalance }) => {
  const [balance, setBalance] = useState<string>(token.amount);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token.amount === '0' && !loading) {
      setLoading(true);
      getTokenBalance(token).then(result => {
        setBalance(result);
        setLoading(false);
      }).catch(() => {
        setBalance('0');
        setLoading(false);
      });
    } else {
      setBalance(token.amount);
    }
  }, [token, getTokenBalance, loading]);

  if (loading) {
    return <TokenListValue>Loading...</TokenListValue>;
  }

  return <TokenListValue>{balance} {token.symbol}</TokenListValue>;
});

TokenBalanceDisplay.displayName = 'TokenBalanceDisplay';

const TokenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  nfts: Token[];
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
  getTokenBalance: (token: Token) => Promise<string>;
}> = React.memo(({ isOpen, onClose, tokens, nfts, onTokenSelect, selectedToken, getTokenBalance }) => {
  const [tokenTab, setTokenTab] = useState<TokenTab>('tokens');
  const [search, setSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const handleTabChange = useCallback((tab: TokenTab) => {
    setTokenTab(tab);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchActive(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setSearchActive(false);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    onClose();
  }, [onTokenSelect, onClose]);

  const filteredItems = useMemo(() => {
    const currentItems = tokenTab === 'tokens' ? tokens : nfts;
    
    if (!search || search.trim() === '') {
      return currentItems;
    }

    const searchTerm = search.toLowerCase().trim();
    
    return currentItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm);
      const symbolMatch = item.symbol.toLowerCase().includes(searchTerm);
      
      let addressMatch = false;
      if (item.address) {
        if (searchTerm.startsWith('0x')) {
          addressMatch = item.address.toLowerCase().startsWith(searchTerm);
        } else {
          addressMatch = item.address.toLowerCase().includes(searchTerm);
        }
      }
      
      let tokenIdMatch = false;
      if (tokenTab === 'nfts' && item.tokenId) {
        tokenIdMatch = item.tokenId.toLowerCase().includes(searchTerm);
      }
      
      return nameMatch || symbolMatch || addressMatch || tokenIdMatch;
    });
  }, [tokens, nfts, tokenTab, search]);

  if (!isOpen) return null;

  return (
    <TokenModalBackdrop onClick={handleBackdropClick}>
      <TokenModalContainer onClick={e => e.stopPropagation()}>
        <TokenModalHeader>
          Select asset to send
          <TokenModalClose onClick={onClose} aria-label="Close">×</TokenModalClose>
        </TokenModalHeader>
        
        <TokenTabs>
          <TokenTab 
            active={tokenTab === 'tokens'} 
            onClick={() => handleTabChange('tokens')}
            type="button"
          >
            Tokens
          </TokenTab>
          <TokenTab 
            active={tokenTab === 'nfts'} 
            onClick={() => handleTabChange('nfts')}
            type="button"
          >
            NFTs
          </TokenTab>
        </TokenTabs>
        
        <TokenSearchBox className={searchActive || (search && search.length > 0) ? 'active' : ''}>
          <SearchIcon />
          <TokenSearchInput
            placeholder={tokenTab === 'tokens' ? "Search tokens by name or address" : "Search NFTs by name, address or token ID"}
            value={search}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </TokenSearchBox>
        
        <TokenList>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = tokenTab === 'nfts' 
                ? (selectedToken?.address === item.address && selectedToken?.tokenId === item.tokenId)
                : (selectedToken?.symbol === item.symbol || (idx === 0 && !selectedToken && !search));
              const displayName = tokenTab === 'nfts' && item.tokenId 
                ? item.name
                : item.name;
              const displaySymbol = tokenTab === 'nfts' && item.tokenId 
                ? item.symbol
                : item.symbol;
              
              return (
                <TokenListItem 
                  key={tokenTab === 'nfts' ? item.address : item.symbol} 
                  selected={isSelected} 
                  type="button"
                  onClick={() => handleTokenSelect(item)}
                >
                  {isSelected && <TokenListItemBar />}
                  <TokenLogos>
                    <TokenLogoBig>
                      {item.symbol === 'COTI' ? (
                        <CotiLogo />
                      ) : (
                        item.symbol[0] || 'N'
                      )}
                    </TokenLogoBig>
                  </TokenLogos>
                  <TokenListInfo>
                    <TokenListName>{displayName}</TokenListName>
                    <TokenListSymbol>{displaySymbol}</TokenListSymbol>
                  </TokenListInfo>
                  <TokenListAmount>
                    {tokenTab === 'tokens' ? (
                      <TokenBalanceDisplay token={item} getTokenBalance={getTokenBalance} />
                    ) : (
                      <TokenListValue>1 NFT</TokenListValue>
                    )}
                  </TokenListAmount>
                </TokenListItem>
              );
            })
          ) : (
            <NoNFTsWrapper>
              <NoNFTsText>
                {tokenTab === 'tokens' ? 'No tokens found' : 'No NFTs imported yet'}
              </NoNFTsText>
              {tokenTab === 'nfts' && (
                <LearnMoreLink 
                  href="https://support.metamask.io/manage-crypto/nfts/nft-tokens-in-your-metamask-wallet" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </LearnMoreLink>
              )}
            </NoNFTsWrapper>
          )}
        </TokenList>
      </TokenModalContainer>
    </TokenModalBackdrop>
  );
});

TokenModal.displayName = 'TokenModal';

export const TransferTokens: React.FC<TransferTokensProps> = React.memo(({ 
  onBack, 
  address, 
  balance,
  aesKey,
  initialToken
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [amount, setAmount] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  
  // Initialize with the passed token if available
  useEffect(() => {
    if (initialToken && !selectedToken) {
      const formattedToken: Token = {
        symbol: initialToken.symbol,
        name: initialToken.name,
        amount: '0',
        usd: 0,
        address: initialToken.address,
        contractAddress: initialToken.contractAddress,
        tokenId: initialToken.tokenId
      };
      setSelectedToken(formattedToken);
    }
  }, [initialToken, selectedToken]);
  const [currentBalance, setCurrentBalance] = useState<string>(balance);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadedTokenAddress, setLoadedTokenAddress] = useState<string>('');
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const { getERC20TokensList, importedTokens } = useImportedTokens();
  const { getAESKey, userHasAESKey } = useSnap();

  const accountBoxRef = useRef<HTMLDivElement>(null);

  const { provider } = useMetaMaskContext();
  const addressValidation = useAddressValidation();

  const browserProvider = useMemo(() => {
    if (!provider) return null;
    return new BrowserProvider(provider as any);
  }, [provider]);

  const tokenOps = browserProvider ? useTokenOperations(browserProvider) : null;

  const { tokens, nfts } = useMemo(() => {
    const erc20Tokens = getERC20TokensList();
    const cotiTokenKey = 'COTI-';
    const cotiToken: Token = { 
      symbol: 'COTI', 
      name: 'COTI', 
      amount: tokenBalances[cotiTokenKey] || balance || '0', 
      usd: 0, 
      address: ''
    };
    
    const importedTokensFormatted: Token[] = erc20Tokens.map(token => {
      const tokenKey = `${token.symbol}-${token.address}`;
      return {
        symbol: token.symbol,
        name: token.name,
        amount: tokenBalances[tokenKey] || '0',
        usd: 0,
        address: token.address
      };
    });

    const allTokens = [cotiToken, ...importedTokensFormatted];
    
    // Filter NFTs from imported tokens (by type ERC721/ERC1155 and address format)
    let nftTokens: Token[] = importedTokens.filter(t => 
      (t.type === 'ERC721' || t.type === 'ERC1155') && t.address.includes('-')
    ).map(nft => {
      const [contractAddress, tokenId] = nft.address.split('-');
      return {
        symbol: nft.symbol,
        name: nft.name,
        amount: nft.type === 'ERC1155' ? '1' : '1',
        usd: 0,
        address: nft.address,
        contractAddress: contractAddress || '',
        tokenId: tokenId || '',
        type: nft.type as 'ERC721' | 'ERC1155'
      };
    });

    if (selectedToken && selectedToken.tokenId) {
      const selectedNFT = nftTokens.find(nft => nft.address === selectedToken.address);
      if (selectedNFT) {
        const otherNFTs = nftTokens.filter(nft => nft.address !== selectedToken.address);
        nftTokens = [selectedNFT, ...otherNFTs];
      }
    }
    
    let finalTokens = allTokens;
    if (selectedToken && !selectedToken.tokenId) {
      const otherTokens = allTokens.filter(t => t.symbol !== selectedToken.symbol);
      finalTokens = [selectedToken, ...otherTokens];
    }
    
    return {
      tokens: finalTokens,
      nfts: nftTokens
    };
  }, [getERC20TokensList, importedTokens, selectedToken, tokenBalances, balance]);

  const currentToken = selectedToken || tokens[0] || { symbol: 'COTI', name: 'COTI', amount: '0', usd: 0 };

  const balanceNum = useMemo(() => parseAmount(currentBalance), [currentBalance]);
  const amountNum = useMemo(() => parseAmount(amount), [amount]);
  const insufficientFunds = useMemo(() => amountNum > balanceNum, [amountNum, balanceNum]);
  const isAmountValid = useMemo(() => {
    if (currentToken?.tokenId && currentToken?.type === 'ERC721') {
      return true;
    }
    return !!amount && !isNaN(amountNum) && amountNum > 0 && amountNum <= balanceNum;
  }, [amount, amountNum, balanceNum, currentToken?.tokenId, currentToken?.type]);

  const canContinue = useMemo(() => 
    addressValidation.isValid && isAmountValid && txStatus !== 'loading',
    [addressValidation.isValid, isAmountValid, txStatus]
  );

  const handleAddressChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddressInput(newAddress);
    addressValidation.validate(newAddress);
    
    if (!aesKey && newAddress.length > 0 && userHasAESKey) {
      await getAESKey();
    }
  }, [addressValidation, aesKey, userHasAESKey, getAESKey]);

  const handleAddressBlur = useCallback(() => {
    if (!addressInput) return;
    addressValidation.validate(addressInput);
  }, [addressInput, addressValidation]);

  const handleClearAddress = useCallback(() => {
    setAddressInput('');
    addressValidation.reset();
  }, [addressValidation]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);

  const handleSetMaxAmount = useCallback(() => {
    setAmount(currentBalance || '0');
  }, [currentBalance]);

  const handleClearAmount = useCallback(() => {
    setAmount('');
  }, []);

  const handleOpenTokenModal = useCallback(() => {
    setShowTokenModal(true);
  }, []);

  const handleCloseTokenModal = useCallback(() => {
    setShowTokenModal(false);
  }, []);

  // Function to get balance for a specific token (for modal display)
  const getTokenBalance = useCallback(async (token: Token): Promise<string> => {
    if (!browserProvider || !tokenOps) return '0';
    
    const tokenKey = `${token.symbol}-${token.address || ''}`;
    
    if (tokenBalances[tokenKey]) {
      return tokenBalances[tokenKey];
    }
    
    try {
      let tokenBalance: string;
      
      if (token.symbol === 'COTI' || !token.address) {
        tokenBalance = balance;
      } else {
        const result = await tokenOps.decryptERC20Balance(token.address, aesKey || '');
        tokenBalance = result.toString();
      }
      
      setTokenBalances(prev => ({
        ...prev,
        [tokenKey]: tokenBalance
      }));
      
      return tokenBalance;
    } catch (error) {
      return '0';
    }
  }, [browserProvider, tokenOps, balance, aesKey, tokenBalances]);

  const fetchTokenBalance = useCallback(async (token: Token) => {
    if (!browserProvider || !tokenOps) return;
    
    setLoadingBalance(true);
    try {
      if (token.symbol === 'COTI' || !token.address) {
        setCurrentBalance(balance);
      } else if (token.type === 'ERC1155' && token.contractAddress && token.tokenId) {
        // For ERC1155 tokens, use getERC1155Balance
        const signer = await browserProvider.getSigner();
        const userAddress = await signer.getAddress();
        const tokenBalance = await tokenOps.getERC1155Balance(token.contractAddress, userAddress, token.tokenId);
        setCurrentBalance(tokenBalance);
      } else {
        // For ERC20 tokens, use decryptERC20Balance
        const tokenBalance = await tokenOps.decryptERC20Balance(token.address, aesKey || '');
        setCurrentBalance(tokenBalance.toString());
      }
    } catch (error) {
      setCurrentBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  }, [browserProvider, tokenOps, balance, aesKey]);

  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedToken(token);
    setAmount('');
    setLoadedTokenAddress('');
    fetchTokenBalance(token);
  }, [fetchTokenBalance]);

  useEffect(() => {
    const tokenKey = `${currentToken?.symbol || 'COTI'}-${currentToken?.address || ''}`;
    
    if (currentToken && browserProvider && tokenOps && loadedTokenAddress !== tokenKey) {
      const loadBalance = async () => {
        setLoadingBalance(true);
        try {
          if (currentToken.symbol === 'COTI' || !currentToken.address) {
            setCurrentBalance(balance);
          } else if (currentToken.type === 'ERC1155' && currentToken.contractAddress && currentToken.tokenId) {
            // For ERC1155 tokens, use getERC1155Balance
            const signer = await browserProvider.getSigner();
            const userAddress = await signer.getAddress();
            const tokenBalance = await tokenOps.getERC1155Balance(currentToken.contractAddress, userAddress, currentToken.tokenId);
            setCurrentBalance(tokenBalance);
          } else {
            // For ERC20 tokens, use decryptERC20Balance
            const tokenBalance = await tokenOps.decryptERC20Balance(currentToken.address, aesKey || '');
            setCurrentBalance(tokenBalance.toString());
          }
          setLoadedTokenAddress(tokenKey);
        } catch (error) {
          setCurrentBalance('0');
          setLoadedTokenAddress(tokenKey);
        } finally {
          setLoadingBalance(false);
        }
      };
      
      loadBalance();
    }
  }, [currentToken?.symbol, currentToken?.address, currentToken?.type, currentToken?.contractAddress, currentToken?.tokenId, browserProvider, tokenOps, balance, aesKey, loadedTokenAddress]);

  const handleContinue = useCallback(async () => {
    if (!provider || !canContinue || !tokenOps) return;

    setTxStatus('loading');
    setTxError(null);

    try {
      let success = false;
      
      if (currentToken.symbol === 'COTI' || !currentToken.address) {
        success = await tokenOps.transferCOTI({ 
          to: addressInput, 
          amount 
        });
      } else if (currentToken.tokenId && currentToken.type === 'ERC721') {
        success = await tokenOps.transferERC721({
          tokenAddress: currentToken.contractAddress || currentToken.address?.split('-')[0] || '',
          to: addressInput,
          tokenId: currentToken.tokenId
        });
      } else if (currentToken.tokenId && currentToken.type === 'ERC1155') {
        if (!amount || amount === '0') {
          throw new Error('Please enter a valid amount for ERC1155 transfer');
        }
        success = await tokenOps.transferERC1155({
          tokenAddress: currentToken.contractAddress || currentToken.address?.split('-')[0] || '',
          to: addressInput,
          tokenId: currentToken.tokenId,
          amount: amount
        });
      } else {
        success = await tokenOps.transferERC20({
          tokenAddress: currentToken.address,
          to: addressInput,
          amount,
          aesKey: aesKey || ''
        });
      }

      if (success) {
        setTxStatus('success');
        fetchTokenBalance(currentToken);
        onBack();
      } else {
        setTxStatus('error');
        setTxError(tokenOps.error || `Error transferring ${currentToken.symbol}`);
      }
    } catch (error: any) {
      setTxStatus('error');
      setTxError(error.message || `Error transferring ${currentToken.symbol}`);
    }
  }, [provider, canContinue, tokenOps, addressInput, amount, currentToken, fetchTokenBalance, onBack]);

  const handleCancel = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <TransferContainer>
      <HeaderBar>
        <HeaderBarSlotLeft>
          <IconButton onClick={onBack} type="button" aria-label="Go back">
            <ArrowBack />
          </IconButton>
        </HeaderBarSlotLeft>
        <HeaderBarSlotTitle>
          <ContentTitle>Send</ContentTitle>
        </HeaderBarSlotTitle>
        <HeaderBarSlotRight />
      </HeaderBar>

      <SectionTitle>From</SectionTitle>
      <AccountBox>
        <JazziconComponent address={address} type="from" />
        <AccountDetails>
          <AccountAddress>{address}</AccountAddress>
        </AccountDetails>
      </AccountBox>

      {addressValidation.isValid && (
        <>
          <AccountBox ref={accountBoxRef}>
            <TokenRowFlex>
              <TokenInfo onClick={handleOpenTokenModal}>
                <TokenLogos>
                  <TokenLogoBig>
                    {currentToken.symbol === 'COTI' ? (
                      <CotiLogo />
                    ) : (
                      currentToken.symbol[0]
                    )}
                  </TokenLogoBig>
                </TokenLogos>
                <TokenName>
                  {currentToken.tokenId && currentToken.type === 'ERC1155' ? 'NFT' : currentToken.symbol}
                  {currentToken.tokenId && (
                    <TokenId tokenId={currentToken.tokenId} />
                  )}
                </TokenName>
                <ArrowDownStyled />
              </TokenInfo>
              <SendAmount>
                {currentToken.tokenId && currentToken.type === 'ERC721' ? (
                  '1 NFT'
                ) : (
                  <>
                    <AmountInput
                      type="number"
                      min="0"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                    {currentToken.tokenId && currentToken.type === 'ERC1155' ? 'NFT' : currentToken.symbol}
                  </>
                )}
              </SendAmount>
            </TokenRowFlex>
          </AccountBox>
          
          <BalanceRow>
            <BalanceSubTransfer error={insufficientFunds}>
              {currentToken?.tokenId && currentToken?.type === 'ERC721' ? (
                `Balance: 1 NFT`
              ) : (
                <>
                  {loadingBalance ? 'Loading balance...' : `Balance: ${currentBalance}${currentToken?.tokenId && currentToken?.type === 'ERC1155' ? ` Tokens` : ''}`}
                  {insufficientFunds && (
                    <ErrorText>
                      {' '}Insufficient funds
                    </ErrorText>
                  )}
                </>
              )}
            </BalanceSubTransfer>
            {!(currentToken?.tokenId && currentToken?.type === 'ERC721') && (
              amount === currentBalance && amount !== '' ? (
                <MaxButton onClick={handleClearAmount} type="button">
                  Clear
                </MaxButton>
              ) : (
                <MaxButton onClick={handleSetMaxAmount} type="button">
                  Max
                </MaxButton>
              )
            )}
          </BalanceRow>
        </>
      )}

      <SectionTitle>To</SectionTitle>
      {!addressValidation.isValid && (
        <InputBox>
          <AddressInput
            placeholder="Enter public address (0x) or domain name"
            value={addressInput}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
          />
        </InputBox>
      )}

      {addressValidation.isValid && (
        <AccountBox>
          <JazziconComponent address={addressInput} type="to" />
          <AccountDetails>
            <AccountAddress>{truncateString(addressInput)}</AccountAddress>
          </AccountDetails>
          <ClearIconButton
            onClick={handleClearAddress}
            aria-label="Clear address"
            type="button"
          >
            <XIcon />
          </ClearIconButton>
        </AccountBox>
      )}

      {addressValidation.isValid && (
        <AccountBox>
          <TokenRowFlex>
            <TokenInfo>
              <TokenLogos>
                <TokenLogoBig>
                  {currentToken.symbol === 'COTI' ? (
                    <CotiLogo />
                  ) : (
                    currentToken.symbol[0]
                  )}
                </TokenLogoBig>
              </TokenLogos>
              <TokenName>
                {currentToken.tokenId && currentToken.type === 'ERC1155' ? 'NFT' : currentToken.symbol}
                {currentToken.tokenId && (
                  <TokenId tokenId={currentToken.tokenId} />
                )}
              </TokenName>
            </TokenInfo>
            <SendAmount>
              {currentToken?.tokenId && currentToken?.type === 'ERC721' ? (
                '1 NFT'
              ) : currentToken?.tokenId && currentToken?.type === 'ERC1155' ? (
                `${amount || '0'} NFT`
              ) : (
                `${amount || '0'} ${currentToken.symbol}`
              )}
            </SendAmount>
          </TokenRowFlex>
        </AccountBox>
      )}

      {addressValidation.status === 'loading' && addressInput && (
        <Alert type="loading">Loading...</Alert>
      )}
      
      {addressValidation.status === 'error' && addressInput && (
        <Alert type="error">No resolution for domain provided</Alert>
      )}

      <BottomActions>
        <SendButton 
          onClick={handleCancel} 
          type="button"
          backgroundColor="#fff"
          textColor="#1E29F6"
        >
          Cancel
        </SendButton>
        <SendButton 
          disabled={!canContinue} 
          onClick={handleContinue}
          type="button"
          backgroundColor="#1E29F6"
          textColor="#fff"
        >
          {txStatus === 'loading' ? 'Sending...' : 'Send'}
        </SendButton>
      </BottomActions>

      <TokenModal
        isOpen={showTokenModal}
        onClose={handleCloseTokenModal}
        tokens={tokens}
        nfts={nfts}
        onTokenSelect={handleTokenSelect}
        selectedToken={selectedToken}
        getTokenBalance={getTokenBalance}
      />
    </TransferContainer>
  );
});

TransferTokens.displayName = 'TransferTokens';