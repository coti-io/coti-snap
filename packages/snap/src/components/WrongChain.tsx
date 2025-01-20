import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

export const WrongChain = () => {
  return (
    <Box direction="vertical" alignment="center">
      <Box direction="horizontal" alignment="center">
        <Heading size="lg">⚠️</Heading>
      </Box>
      <Box direction="horizontal" alignment="center">
        <Heading size="sm">Wrong chain</Heading>
      </Box>
      <Box direction="horizontal" alignment="center">
        <Text color="warning" alignment="center">
          Please switch to COTI Testnet chain to view your tokens.
        </Text>
      </Box>
    </Box>
  );
};
