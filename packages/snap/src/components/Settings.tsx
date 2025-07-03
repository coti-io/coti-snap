import {
  Box,
  Heading,
  Link,
  Section,
} from '@metamask/snaps-sdk/jsx';

import { COMPANION_DAPP_LINK } from '../config';

export const Settings = () => {
  return (
    <Section alignment="center">
      <Box alignment="center" direction="vertical">
        <Box alignment="center" direction="horizontal">
          <Heading>Go to dapp to view your AES Key or delete it.</Heading>
        </Box>
      </Box>
      <Box alignment="center" direction="horizontal">
        <Link href={COMPANION_DAPP_LINK}>Go to dapp</Link>
      </Box>
    </Section>
  );
};
