import {
  Container,
  Form,
  Button,
  Input,
  Field,
  Footer,
} from '@metamask/snaps-sdk/jsx';

export const ImportToken = () => {
  return (
    <Container>
      <Form name="form-to-fill">
        <Field label="Token Name" error="Token name is required">
          <Input name="token-name" placeholder="Token Name" />
        </Field>
        <Field label="Token Symbol" error="Token symbol is required">
          <Input name="token-symbol" placeholder="Token Symbol" />
        </Field>
        <Field label="Token Address" error="Token address is required">
          <Input name="token-address" type="text" placeholder="0x123..." />
        </Field>
        <Field label="Token Decimals" error="Token decimals is required">
          <Input name="token-decimals" type="text" placeholder="8" />
        </Field>
        {/*
          //TODO: Add token icon
          <Field label="Token Icon">
            <Input name="token-image" placeholder="https//..." />
          </Field>
          //TODO: Add token decimals
          <Field label="Token Decimals">
            <Input name="token-decimals" placeholder="8" />
          </Field>
          */}
      </Form>
      <Footer>
        <Button name="token-cancel">Cancel</Button>
        <Button name="token-submit">Submit</Button>
      </Footer>
    </Container>
  );
};
