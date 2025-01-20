import {
  Button,
  Container,
  Field,
  Footer,
  Form,
  Heading,
  Input,
} from '@metamask/snaps-sdk/jsx';

export const ImportERC20 = ({
  address,
  symbol,
  name,
  decimals,
  errorInForm = false,
}: {
  address?: string;
  symbol?: string | null;
  name?: string | null;
  decimals?: string | null;
  errorInForm?: boolean;
}) => {
  return (
    <Container>
      <Form name="erc20-form-to-fill">
        <Heading size="lg">Import new token</Heading>
        <Field
          label="Token address"
          error={errorInForm ? 'Token address is required' : undefined}
        >
          <Input type="text" name="token-address" placeholder="0x123..." />
        </Field>
        <Field
          label="Token symbol"
          error={errorInForm ? 'Token address is required' : undefined}
        >
          <Input
            type="text"
            name="token-symbol"
            placeholder="MYTKN"
            value={symbol ?? ''}
          />
        </Field>
        <Field
          label="Token name"
          error={errorInForm ? 'Token name is required' : undefined}
        >
          <Input
            type="text"
            name="token-name"
            placeholder="My token"
            value={name ?? ''}
          />
        </Field>
        <Field
          label="Token decimals"
          error={errorInForm ? 'Token decimals is required' : undefined}
        >
          <Input
            type="text"
            name="token-decimals"
            placeholder="6"
            value={decimals ?? ''}
          />
        </Field>
      </Form>
      <Footer>
        <Button name="token-cancel">Cancel</Button>
        <Button name="token-erc20-submit">Submit</Button>
      </Footer>
    </Container>
  );
};
