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
        <Heading>Visit the COTI companion dapp to manage your AES key.</Heading>
        <Box alignment="center" direction="horizontal">
          <Link href={COMPANION_DAPP_LINK}>Go to companion dapp</Link>
        </Box>
      </Box>
      <Footer>
        <Button name="token-cancel">Go back</Button>
      </Footer>
    </Container>
  );
};
