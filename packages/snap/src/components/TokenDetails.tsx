import {
  Button,
  Box,
  Heading,
  Text,
  Copyable,
  Icon,
  Image,
  Link,
  Bold,
  Section,
} from '@metamask/snaps-sdk/jsx';
import type { Token } from 'src/types';
import { TokenViewSelector } from '../types';

import defaultToken from '../../images/default.svg';
import logo from '../../images/logo.svg';

export const TokenDetails = ({ token }: { token: Token }) => {
  const renderNFTDetails = () => (
    <Section>
      <Box direction="vertical" alignment="center">
        <Heading size="lg">My NFT</Heading>
        <Image src={token.image || defaultToken} alt={`NFT ${token.name}`} />
      </Box>
      <Button name="token-cancel">
        See in...
      </Button>
    </Section>
  );

  const renderTokenDetails = () => (
    <Box direction="vertical" alignment="space-between">
      <Box direction="vertical" alignment="start">
        <Box direction="horizontal">
          <Button name="token-cancel">
            <Icon name="arrow-left" />
          </Button>
          <Text>
            <Bold>{token.symbol}</Bold>
          </Text>
        </Box>

        <Box direction="horizontal" alignment="start">
          <Text> </Text>
        </Box>
        <Box direction="horizontal" alignment="start">
          <Heading size="md">Your balance</Heading>
        </Box>
        <Box direction="horizontal" alignment="space-between">
          <Box alignment="space-between" direction="horizontal">
            <Box alignment="center" direction="horizontal">
              <Box alignment="center" direction="vertical">
                <Image src={logo} alt="Token logo" />
              </Box>
              <Box direction="vertical" alignment="center">
                <Text>{token.name}</Text>
              </Box>
            </Box>
          </Box>
          <Box direction="vertical" alignment="end">
            <Text>
              {token.balance} {token.symbol}
            </Text>
          </Box>
        </Box>
        <Box direction="horizontal" alignment="start">
          <Text> </Text>
        </Box>
        <Box direction="horizontal" alignment="start">
          <Heading size="md">Token details</Heading>
        </Box>
        <Box direction="horizontal" alignment="space-between">
          <Text>Contract address</Text>
          <Copyable value={token.address} />
        </Box>
        {token.uri ? (
          <Box direction="horizontal" alignment="space-between">
            <Text>Token URI</Text>
            <Link href={token.uri}>Open</Link>
          </Box>
        ) : null}
        {token.tokenId ? (
          <Box direction="horizontal" alignment="space-between">
            <Text>Token ID</Text>
            <Text>{token.tokenId}</Text>
          </Box>
        ) : null}
        {token.image ? (
          <Box direction="horizontal" alignment="space-between">
            <Image src={token.image} alt={`${token.name} image`} />
          </Box>
        ) : null}
        {token.decimals ? (
          <Box direction="horizontal" alignment="space-between">
            <Text>Token decimals</Text>
            <Text>{token.decimals}</Text>
          </Box>
        ) : null}
      </Box>
      <Button
        variant="destructive"
        name={`confirm-hide-token-${token.address}`}
      >
        Hide token
      </Button>
    </Box>
  );

  return token.type === TokenViewSelector.NFT ? renderNFTDetails() : renderTokenDetails();
};

export default TokenDetails;
