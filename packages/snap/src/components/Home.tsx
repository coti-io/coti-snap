import {
  Box,
  Text,
  Button,
  Section,
  Divider,
  Heading,
  Link,
  Icon,
  Banner,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import { COMPANION_DAPP_LINK } from '../config';
import type { Tokens } from '../types';
import { TokenViewSelector } from '../types';
import { TokenAdded } from './TokenAdded';

type HomeProps = {
  balance: bigint;
  tokenBalances: Tokens;
  aesKey: string | null;
  tokenView?: TokenViewSelector;
};
export const Home = ({
  balance,
  tokenBalances,
  aesKey,
  tokenView,
}: HomeProps) => {
  const formatedBalance = formatEther(balance).slice(
    0,
    formatEther(balance).indexOf('.') + 4,
  );
  return (
    <Box>
      {!aesKey && (
        <Box direction="horizontal" alignment="center">
          <Banner title="" severity="info">
            <Text>To view your balances, you must first register your account. Click on the button below to get started</Text>
          </Banner>
        </Box>
      )}
      <Section>
        <Box alignment="center" direction="vertical">
          <Box alignment="center" direction="horizontal">
            <Heading size="lg">{formatedBalance} COTI</Heading>
          </Box>
          <Box direction="horizontal" alignment="start">
            <Text> </Text>
          </Box>
          {!aesKey && (
            <Box direction="vertical" alignment="center">
              <Box direction="horizontal" alignment="center">
                <Link href={COMPANION_DAPP_LINK}>Onboard account</Link>
              </Box>
              <Box direction="horizontal" alignment="space-around">
                <Text color="muted" alignment="center" size="sm">
                  Add your AES Key to view your tokens and NFTs
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
              <Text>
                {tokenView === TokenViewSelector.ERC20
                  ? 'No tokens imported. Use the import button on the right...'
                  : 'No NFTs imported. Use the import button on the right...'}
              </Text>
            )}
          </Box>
        </Box>
      </Section>
      <Box direction="horizontal" alignment="start">
        <Button name="settings-button">
          <Icon name="setting" size="md" color="primary" />
          Settings
        </Button>
      </Box>
    </Box>
  );
};
