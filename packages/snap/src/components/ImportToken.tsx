import { Container, Form, Button, Input, Field, Footer } from '@metamask/snaps-sdk/jsx';

export const ImportToken = () => {
  return (
    <Container>
      <Form name="form-to-fill">
        <Field label="Token Name" error='Token name is required'>
          <Input name="token-name" placeholder="Token Name" />
        </Field>
        <Field label="Token Symbol" error='Token symbol is required'>
          <Input name="token-symbol" placeholder="Token Symbol" />
        </Field>
        <Field label="Token Address" error='Token address is required'>
          <Input name="token-address" placeholder="0x123..." />
        </Field>
      </Form>
      <Footer>
        <Button name="token-submit" type='submit'>Submit</Button>
        <Button name="token-cancel">Cancel</Button>
      </Footer>
    </Container>
  );
}