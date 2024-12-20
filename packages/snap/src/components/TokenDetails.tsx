import { Container, Form, Button, Input, Field, Footer, Box, Heading, Link, Text, Address, Copyable } from '@metamask/snaps-sdk/jsx';

type TokenDetailsProps = {
  tokenName: string
  tokenBalance: string
  tokenAddress: string
}

export const TokenDetails = ({ tokenName, tokenBalance, tokenAddress }: TokenDetailsProps) => {
  return (
    <Container>
      <Box>
      <Box>
        <Heading>Token Name</Heading>
        <Text>{tokenName}</Text>
        <Heading>Address</Heading>
        <Copyable value={tokenAddress} />
        <Heading>Balance</Heading>
        <Text>{tokenBalance}</Text>
      </Box>
      </Box>
      <Footer>
        <Button name="token-cancel">Go back</Button>
      </Footer>
    </Container>
  );
}