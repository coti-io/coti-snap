import { decrypt, encodeKey } from '@coti-io/coti-sdk-typescript';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';
import type { SnapConfirmationInterface, SnapHandlerInterface } from '@metamask/snaps-jest';

describe('onHomePage', () => {
  it('renders the home page', async () => {
    const { onHomePage } = await installSnap();
    const response = await onHomePage()
    expect(response).toRender(
      <Box>
        <Heading>Welcome to the home page</Heading>
        <Text>This is the home page of the snap</Text>
      </Box>,
    );
  });
});
