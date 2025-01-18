import { Container, Field, Form, Input } from '@metamask/snaps-sdk/jsx';

import type { TokenViewSelector } from '../types';

export const ImportERC20 = ({
  tokenType,
  errorInForm = false,
}: {
  tokenType: TokenViewSelector;
  errorInForm?: boolean;
}) => {
  return (
    <Container>
      <Form name="form-to-fill">
        <Field
          label="Token Address"
          error={errorInForm ? 'Token address is required' : undefined}
        >
          <Input name="token-address" placeholder="0x123..." />
        </Field>
      </Form>
    </Container>
  );
};
