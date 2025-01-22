import { Box, Button, Heading, Section, Text } from '@metamask/snaps-sdk/jsx';

type HideTokenProps = {
  tokenAddress: string;
};

export const HideToken = ({ tokenAddress }: HideTokenProps) => {
  return (
    <Box direction="vertical" alignment="center">
      <Section>
        <Box direction="vertical" alignment="center">
          <Heading size="md">Hide token?</Heading>
          <Text>
            You can add this token back in the future by going to “Import token”
            in your accounts menu.
          </Text>
          <Box direction="horizontal" alignment="space-around">
            <Button
              variant="destructive"
              name={`token-details-${tokenAddress}`}
            >
              Cancel
            </Button>
            <Button name={`hide-token-confirmed-${tokenAddress}`}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Section>
    </Box>
  );
};
