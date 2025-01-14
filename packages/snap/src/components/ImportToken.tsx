import {
  Container,
  Form,
  Button,
  Input,
  Field,
  Footer,
  Heading,
} from '@metamask/snaps-sdk/jsx';
import { TokenViewSelector } from '../types';

export const ImportToken = ({tokenType, errorInForm = false}: {tokenType: TokenViewSelector, errorInForm?: boolean}) => {
  return (
    <Container>
      <Form name="form-to-fill">
        <Heading size="lg">Import {tokenType === TokenViewSelector.NFT ? 'ERC721' : 'ERC20'} Token</Heading>
        <Field label="Token Name" error={errorInForm ? "Token name is required" : undefined}>
          <Input name="token-name" placeholder="Token Name" />
        </Field>
        <Field label="Token Symbol" error={errorInForm ? "Token symbol is required" : undefined}>
          <Input name="token-symbol" placeholder="Token Symbol" />
        </Field>
        <Field label="Token Address" error={errorInForm ? "Token address is required" : undefined}>
          <Input name="token-address" placeholder="0x123..." />
        </Field>
        {tokenType === TokenViewSelector.NFT && (
          <Field label="Token ID" error={errorInForm ? "Token ID is required" : undefined}>
            <Input name="token-id" placeholder="Token ID" />
          </Field>
        )}
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
        <Button name="token-submit" type="submit">
          Submit
        </Button>
      </Footer>
    </Container>
  );
};
