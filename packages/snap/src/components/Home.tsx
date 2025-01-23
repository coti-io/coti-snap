import {
  Box,
  Text,
  Button,
  Section,
  Divider,
  Heading,
  Link,
  Icon,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import { COMPANION_DAPP_LINK } from '../config';
import type { Tokens } from '../types';
import { TokenViewSelector } from '../types';
import { TokenAdded } from './TokenAdded';
import { WrongChain } from './WrongChain';

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
                <Link href={COMPANION_DAPP_LINK}>Onboard account</Link>
              </Box>
              <Box direction="horizontal" alignment="center">
                <Text color="muted" alignment="center">
                  Add your AES Key to view your encrypted tokens and NFTs{' '}
                </Text>
              </Box>
            </Box>
          )}
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
            <Text> </Text>
          </Box>

          <Box direction="vertical">
            <Box alignment="space-around" direction="horizontal">
              {tokenView === TokenViewSelector.ERC20 ? (
                <Heading>Tokens</Heading>
              ) : (
                <Button name="view-tokens-erc20">Tokens</Button>
              )}
              {tokenView === TokenViewSelector.NFT ? (
                <Heading>NFT</Heading>
              ) : (
                <Button name="view-tokens-nft">NFT</Button>
              )}
            </Box>
            <Divider />
            <Box direction="horizontal" alignment="start">
              <Text> </Text>
              <Text> </Text>
            </Box>
            <Box alignment="space-between" direction="horizontal">
              <Heading size="sm">
                {tokenView === TokenViewSelector.ERC20 ? 'Tokens' : 'NFT'}
              </Heading>
              <Button
                name={
                  tokenView === TokenViewSelector.ERC20
                    ? 'import-erc20'
                    : 'import-erc721'
                }
              >
                + Import
              </Button>
            </Box>
            <Box direction="horizontal" alignment="start">
              <Text> </Text>
            </Box>
            {tokenBalances.filter((token) => token.type === tokenView)
              .length ? (
              tokenBalances
                .filter((token) => token.type === tokenView)
                .map((token) => (
                  <TokenAdded key={token.address} token={token} />
                ))
            ) : (
              <Text>No tokens was added yet</Text>
            )}
          </Box>
        </Box>
      </Section>
      <Box alignment="start" direction="horizontal">
        <Button name="settings-button">
          <Icon name="setting" color="primary" size="md" />
        </Button>
      </Box>
    </Box>
  );
};
