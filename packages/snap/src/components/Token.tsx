/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Box, Button, Icon, Image, Text } from '@metamask/snaps-sdk/jsx';
import type { Token as TokenType } from 'src/types';
import { getTokenPriceInUSD } from 'src/utils/token';

import defaultToken from '../../images/default-token.svg';

export const Token = ({ token }: { token: TokenType }) => {
  const price = getTokenPriceInUSD(token.symbol);

  let simplePrice = '';

  let USDPrice = '';
  if (price instanceof Promise) {
    price
      .then((resolvedPrice) => {
        USDPrice = resolvedPrice || '';
        simplePrice = resolvedPrice || '';
      })
      .catch(() => {
        USDPrice = '';
      });
  } else {
    USDPrice = price || '';
  }

  const totalBalanceInUSD =
    parseFloat(token.balance || '0') * parseFloat(USDPrice || '0');

  return (
    <Box key={token.address} direction="horizontal" alignment="space-between">
      <Box alignment="space-between" direction="horizontal">
        <Box alignment="center" direction="horizontal">
          <Box alignment="center" direction="vertical">
            <Image src={defaultToken} />
          </Box>
          <Box direction="vertical" alignment="center">
            {/* <Text>{token.symbol}</Text> */}
            <Text>AAAAAAAAAAAAAAAAAAAa</Text>
          </Box>
        </Box>
      </Box>

      <Text>Price: {simplePrice}</Text>
      <Box alignment="space-between" direction="horizontal">
        <Box direction="vertical" alignment="end">
          <Text>Price: {simplePrice}</Text>
          <Text>
            {token.balance?.length === 0 || token.balance === null
              ? '0.0'
              : token.balance}{' '}
            {token.symbol}
          </Text>
          <Text color="muted">{simplePrice} USD</Text>
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
