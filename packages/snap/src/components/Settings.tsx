import { Container, Form, Button, Input, Field, Footer, Box, Heading, Link } from '@metamask/snaps-sdk/jsx';

export const Settings = () => {
  return (
    <Container>
      <Box>
        <Heading>Go to dapp to view your AES Key or delete it.</Heading>
        <Box alignment='center' direction='horizontal'>
          <Link href="https://coti.io">Go to dapp</Link>
        </Box>
      </Box>
      <Footer>
        <Button name="token-cancel">Go back</Button>
      </Footer>
    </Container>
  );
}