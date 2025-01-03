/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Box, Button, Icon, Image, Text } from '@metamask/snaps-sdk/jsx';
import type { Token } from 'src/types';

import defaultToken from '../../images/default-token.svg';

export const TokenAdded = ({ token }: { token: Token }) => {
  // TODO: Add the token price in USD
  // TODO: Add the token logo

  return (
    <Box alignment="space-between" direction="horizontal">
      <Box alignment="center" direction="horizontal">
        <Box alignment="center" direction="vertical">
          <Image src={defaultToken} />
        </Box>
        <Box direction="vertical" alignment="center">
          <Text>{token.symbol}</Text>
        </Box>
      </Box>
      <Box alignment="space-between" direction="horizontal">
        <Box direction="vertical" alignment="end">
          <Text>
            {token.balance?.length === 0 || token.balance === null
              ? '0.0'
              : token.balance}{' '}
            {token.symbol}
          </Text>
          <Text color="muted">{} USD</Text>
        </Box>
        <Box direction="vertical" alignment="center">
          <Button name={`token-details-${token.address}`}>
            <Icon name="arrow-right" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
