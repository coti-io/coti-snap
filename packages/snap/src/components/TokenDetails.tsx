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
} from '@metamask/snaps-sdk/jsx';
import type { Token } from 'src/types';

import defaultToken from '../../images/default-token.svg';
import send from '../../images/send.svg';

export const TokenDetails = ({ token }: { token: Token }) => {
  return (
    <Box direction="vertical" alignment="start">
      <Box direction="horizontal" alignment="start">
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
              <Image src={defaultToken} />
            </Box>
            <Box direction="vertical" alignment="center">
              <Text>{token.symbol}</Text>
              {/* <Text color="muted">{tokenSymbol}</Text> */}
            </Box>
          </Box>
        </Box>
        <Box direction="vertical" alignment="end">
          <Text>
            {token.balance} {token.symbol}
          </Text>
          {/* <Text color="muted">USD</Text> */}
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
      {Boolean(token.uri) && (
        <Box direction="horizontal" alignment="space-between">
          <Text>Token URI</Text>
          <Link href={token.uri}>Open</Link>
        </Box>
      )}
      {Boolean(token.image) && (
        <Box direction="horizontal" alignment="space-between">
          <Image src={token.image} />
        </Box>
      )}
      {Boolean(token.decimals) && (
        <Box direction="horizontal" alignment="space-between">
          <Text>Token decimals</Text>
          {/* TODO: Add decimals */}
          <Text>{token.decimals}</Text>
        </Box>
      )}
      <Box direction="vertical">
        <Text>Token list</Text>
        <Text>{token.name}</Text>
      </Box>
      <Box direction="horizontal" alignment="start">
        <Text> </Text>
      </Box>
      <Button
        variant="destructive"
        name={`confirm-hide-token-${token.address}`}
      >
        Hide token
      </Button>
    </Box>
  );
};
