import {
  Button,
  Box,
  Heading,
  Text,
  Copyable,
  Icon,
  Image,
} from '@metamask/snaps-sdk/jsx';

import defaultToken from '../../images/default-token.svg';
import send from '../../images/send.svg';

type TokenDetailsProps = {
  tokenName: string;
  tokenBalance: string;
  tokenAddress: string;
  tokenSymbol: string;
};

export const TokenDetails = ({
  tokenName,
  tokenBalance,
  tokenAddress,
  tokenSymbol,
}: TokenDetailsProps) => {
  return (
    <Box direction="vertical" alignment="start">
      <Box direction="horizontal" alignment="start">
        <Button name="token-cancel">
          <Icon name="arrow-left" />
        </Button>
        <Text>{tokenSymbol}</Text>
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
              <Text>{tokenSymbol}</Text>
              <Text color="muted">{tokenSymbol}</Text>
            </Box>
          </Box>
        </Box>
        <Box direction="vertical" alignment="end">
          <Text>{tokenBalance}</Text>
          <Text color="muted">USD</Text>
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
        <Copyable value={tokenAddress} />
      </Box>
      <Box direction="horizontal" alignment="space-between">
        <Text>Token decimals</Text>
        {/* TODO: Add decimals */}
        <Text>18</Text>
      </Box>
      <Box direction="vertical">
        <Text>Token list</Text>
        <Text>{tokenName}</Text>
      </Box>
      <Box direction="horizontal" alignment="start">
        <Text> </Text>
      </Box>
      <Button variant="destructive" name={`confirm-hide-token-${tokenAddress}`}>
        Hide token
      </Button>
      <Box direction="horizontal" alignment="start">
        <Text> </Text>
      </Box>
      <Box direction="vertical" alignment="start">
        <Heading size="md">Your activity</Heading>
      </Box>
      <Box direction="vertical" alignment="start">
        <Text>Dec 2, 2024</Text>
        <Box direction="horizontal" alignment="space-between">
          <Box alignment="space-between" direction="horizontal">
            <Box alignment="center" direction="horizontal">
              <Box alignment="center" direction="vertical">
                <Image src={send} />
              </Box>
              <Box direction="vertical" alignment="center">
                <Text>{tokenSymbol}</Text>
                <Text color="success">Confirmed</Text>
              </Box>
            </Box>
          </Box>

          <Box alignment="space-between" direction="horizontal">
            <Box direction="vertical" alignment="end">
              {/* TODO: Add token balances */}
              <Text>{tokenSymbol}</Text>
              <Text color="muted">USD</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
