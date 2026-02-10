import {
  Container,
  Form,
  Button,
  Input,
  Field,
  Footer,
  Heading,
} from '@metamask/snaps-sdk/jsx';

export const ImportERC721 = ({
  errorInForm = false,
  errorType = 'general',
}: {
  errorInForm?: boolean;
  errorType?: 'general' | 'ownership' | 'duplicate';
}) => {
  const getErrorMessage = () => {
    if (!errorInForm) {
      return undefined;
    }

    switch (errorType) {
      case 'ownership':
        return 'You must own this NFT to import it';
      case 'duplicate':
        return 'This NFT is already in your list';
      default:
        return 'Please check the token address and ID';
    }
  };

  return (
    <Container>
      <Form name="erc721-form-to-fill">
        <Heading size="lg">Import new NFT</Heading>
        <Field
          label="Token Address"
          error={errorInForm ? 'Valid token address is required' : undefined}
        >
          <Input name="erc721-address" placeholder="0x123..." />
        </Field>
        <Field
          label="Token ID"
          error={errorInForm ? getErrorMessage() : undefined}
        >
          <Input name="erc721-id" placeholder="Token ID" />
        </Field>
      </Form>
      <Footer>
        <Button name="token-cancel">Cancel</Button>
        <Button name="erc721-submit">Submit</Button>
      </Footer>
    </Container>
  );
};
