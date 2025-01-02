import {
  Box,
  Text,
  Button,
  Section,
  Divider,
  Heading,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import type { Tokens, TokenViewSelector } from '../types';
import { Token } from './Token';

type HomeProps = {
  balance: bigint;
  tokenBalances: Tokens;
  tokenView?: TokenViewSelector;
};

export const Home = ({ balance, tokenBalances, tokenView }: HomeProps) => {
  const formatedBalance = parseFloat(formatEther(balance)).toFixed(2);
  return (
    <Box>
      <Section>
        <Box alignment="center" direction="horizontal">
          <Heading size="lg">{formatedBalance} COTI</Heading>
        </Box>
        <Box alignment="space-around" direction="horizontal">
          <Button name="view-tokens-tokens">Tokens</Button>
          <Button name="view-tokens-nft">NFT</Button>
        </Box>
        <Divider />
        <Box alignment="end" direction="horizontal">
          <Button name="import-token-button">Import</Button>
        </Box>
        {tokenBalances.filter((token) => token.type === tokenView).length ? (
          tokenBalances
            .filter((token) => token.type === tokenView)
            .map((token) => <Token key={token.address} token={token} />)
        ) : (
          <Text>No tokens was added yet</Text>
        )}
      </Section>
      <Box alignment="start" direction="horizontal">
        <Button name="settings-button">Settings</Button>
      </Box>
    </Box>
  );
};
