import {
  Box,
  Text,
  Button,
  Section,
  Divider,
  Heading,
  Link,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import type { Tokens, TokenViewSelector } from '../types';
import { TokenAdded } from './TokenAdded';

type HomeProps = {
  balance: bigint;
  tokenBalances: Tokens;
  AESKey: string | null;
  tokenView?: TokenViewSelector;
};

export const Home = ({
  balance,
  tokenBalances,
  AESKey,
  tokenView,
}: HomeProps) => {
  const formatedBalance = parseFloat(formatEther(balance)).toFixed(2);
  return (
    <Box>
      <Section>
        <Box alignment="center" direction="vertical">
          <Box alignment="center" direction="horizontal">
            <Heading size="lg">{formatedBalance} COTI</Heading>
          </Box>
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
          </Box>
          {!AESKey && (
            <Box direction="vertical" alignment="center">
              <Box direction="horizontal" alignment="center">
                <Link href="https://metamask.io">Onboard account </Link>
              </Box>
              <Box direction="horizontal" alignment="center">
                <Text color="muted" alignment="center">
                  Add your AES Key to view your tokens and NFTs{' '}
                </Text>
              </Box>
            </Box>
          )}
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
          </Box>
          <Box alignment="space-around" direction="horizontal">
            <Button name="view-tokens-tokens">Tokens</Button>
            <Button name="view-tokens-nft">NFT</Button>
          </Box>
          <Divider />
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
          </Box>
          <Box alignment="space-between" direction="horizontal">
            <Heading size="sm">
              {tokenView === 'erc20' ? 'Tokens' : 'NFT'}
            </Heading>
            <Button name="import-token-button">+ Import</Button>
          </Box>
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
          </Box>
          {tokenBalances.filter((token) => token.type === tokenView).length ? (
            tokenBalances
              .filter((token) => token.type === tokenView)
              .map((token) => <TokenAdded key={token.address} token={token} />)
          ) : (
            <Text>No tokens was added yet</Text>
          )}
        </Box>
      </Section>
      <Box alignment="start" direction="horizontal">
        <Button name="settings-button">Settings</Button>
      </Box>
    </Box>
  );
};
