import {
  Container,
  Button,
  Footer,
  Box,
  Heading,
  Link,
} from '@metamask/snaps-sdk/jsx';

import { COMPANION_DAPP_LINK } from '../config';

export const Settings = () => {
  return (
    <Container>
      <Box>
        <Heading>Go to dapp to view your AES Key or delete it.</Heading>
        <Box alignment="center" direction="horizontal">
          <Link href={COMPANION_DAPP_LINK}>Go to dapp</Link>
        </Box>
      </Box>
      <Footer>
        <Button name="token-cancel">Go back</Button>
      </Footer>
    </Container>
  );
};
