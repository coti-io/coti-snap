import { Box, Button, Icon, Image, Text } from '@metamask/snaps-sdk/jsx';

import defaultToken from '../../images/default-token.svg';
import { TokenViewSelector, type Token } from '../types';

export const TokenAdded = ({ token }: { token: Token }) => {
  return token.type === TokenViewSelector.NFT ? (
    <Box alignment="space-between" direction="horizontal">
      <Box alignment="center" direction="horizontal">
        <Box direction="vertical" alignment="center">
          <Text>{token.name}</Text>
        </Box>
      </Box>
      <Box direction="vertical" alignment="center">
        <Button name={`token-details-${token.address}`}>View NFT</Button>
      </Box>
    </Box>
  ) : (
    <Box alignment="space-between" direction="horizontal">
      <Box alignment="center" direction="horizontal">
        <Box alignment="center" direction="vertical">
          <Image src={defaultToken} />
        </Box>
        <Box direction="vertical" alignment="center">
          <Text>{token.symbol}</Text>
        </Box>
      </Box>
      <Box alignment="center" direction="horizontal">
        <Box direction="vertical" alignment="center">
          <Text>
            {token.balance ? token.balance : '(encrypted)'} {token.symbol}
          </Text>
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
