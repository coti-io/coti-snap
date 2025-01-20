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
}: {
  errorInForm?: boolean;
}) => {
  return (
    <Container>
      <Form name="erc721-form-to-fill">
        <Heading size="lg">Import new NFT</Heading>
        <Field
          label="Token Address"
          error={errorInForm ? 'Token address is required' : undefined}
        >
          <Input name="erc721-address" placeholder="0x123..." />
        </Field>
        <Field
          label="Token ID"
          error={errorInForm ? 'Token ID is required' : undefined}
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
