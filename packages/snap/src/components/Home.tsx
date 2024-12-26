import {
  Box,
  Text,
  Button,
  Section,
  Selector,
  SelectorOption,
  Card,
  SnapComponent,
  Divider,
  Heading,
  Row,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import type { Tokens } from '../types';
import { TokenViewSelector } from '../types';

type HomeProps = {
  balance: bigint;
  tokenBalances: Tokens;
  tokenView?: TokenViewSelector;
};

export const Home = ({ balance, tokenBalances, tokenView }: HomeProps) => {
  const formatedBalance = parseFloat(formatEther(balance)).toFixed(2);
  return (
    <Box>
      <Box alignment="center" direction="horizontal">
        <Heading size="lg">{formatedBalance} COTI</Heading>
      </Box>
      <Section>
        <Selector name="selector-tokens-nft" title="Select Token type">
          <SelectorOption value={TokenViewSelector.ERC20}>
            <Card title="Tokens" value="ERC20" />
          </SelectorOption>
          <SelectorOption value={TokenViewSelector.NFT}>
            <Card title="NFT" value="ERC721/ERC1155" />
          </SelectorOption>
        </Selector>
        <Box alignment="center" direction="horizontal">
          <Button
            name="view-tokens-tokens"
            variant={
              tokenView === TokenViewSelector.ERC20 ? 'destructive' : 'primary'
            }
          >
            Tokens
          </Button>
          <Button
            name="view-tokens-nft"
            variant={
              tokenView === TokenViewSelector.NFT ? 'destructive' : 'primary'
            }
          >
            NFT
          </Button>
        </Box>
        <Divider />
        {tokenBalances.filter((token) => token.type == tokenView).length ? (
          tokenBalances
            .filter((token) => token.type == tokenView)
            .map((token) => (
              <Box>
                <Card
                  title={token.name}
                  value={String(token.balance) || 'N/A'}
                  description={`${token.address.substring(0, 7)}...`}
                />
                <Button name={`token-details-${token.address}`}>details</Button>
              </Box>
            ))
        ) : (
          <Text>No tokens was added yet</Text>
        )}
      </Section>
      {tokenView === TokenViewSelector.ERC20 && (
        <Heading size="md">ERC20 Tokens</Heading>
      )}
      {tokenView === TokenViewSelector.NFT && <Heading size="md">NFT</Heading>}
      <Box alignment="space-between" direction="horizontal">
        <Button name="import-token-button">Import Token</Button>
        <Button name="settings-button">Settings</Button>
      </Box>
    </Box>
  );
};
