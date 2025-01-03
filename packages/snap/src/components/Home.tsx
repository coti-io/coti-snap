import {
  Box,
  Text,
  Button,
  Section,
  Divider,
  Heading,
  Icon,
  Image,
} from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';

import defaultToken from '../../images/default-token.svg';
import type { Tokens, TokenViewSelector } from '../types';

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
            .map((token) => (
              <Box
                key={token.address}
                direction="horizontal"
                alignment="space-between"
              >
                <Box alignment="space-between" direction="horizontal">
                  <Box alignment="center" direction="horizontal">
                    <Box alignment="center" direction="vertical">
                      <Image src={defaultToken} />
                    </Box>
                    <Box direction="vertical" alignment="center">
                      <Text>{token.symbol}</Text>
                    </Box>
                  </Box>
                </Box>

                <Box alignment="space-between" direction="horizontal">
                  <Box direction="vertical" alignment="end">
                    <Text>{token.symbol}</Text>
                    <Text>{token.symbol}</Text>
                  </Box>
                  <Box direction="vertical" alignment="center">
                    <Button name={`token-details-${token.address}`}>
                      <Icon name="arrow-right" />
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))
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
