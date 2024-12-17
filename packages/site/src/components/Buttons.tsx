import type { ComponentProps } from 'react';
import styled from 'styled-components';

import { useMetaMask, useRequestSnap } from '../hooks';
import { shouldDisplayReconnectButton } from '../utils';

const Link = styled.a`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  background-color: ${(props) => props.theme.colors.background?.inverse};
  color: ${(props) => props.theme.colors.text?.inverse};
  text-decoration: none;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.default};
  }

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    box-sizing: border-box;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  background-color: ${(props) =>
    props.$primary
      ? props.theme.colors.primary?.default
      : props.theme.colors.background?.content};
  color: ${(props) =>
    props.$primary
      ? props.theme.colors.primary?.inverse
      : props.theme.colors.primary?.default};
  border: ${(props) => (props.$primary ? 'none' : `1px solid #0EB592`)};
  font-weight: bold;
  padding: 12px;
  min-height: 4.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) =>
      props.$primary
        ? props.theme.colors.primary?.hover
        : props.theme.colors.secondary?.default10};
    border: ${(props) => (props.$primary ? 'none' : `1px solid #0EB592`)};
    color: ${(props) =>
      props.$primary
        ? props.theme.colors.primary?.inverse
        : props.theme.colors.primary?.default};
  }

  &:disabled,
  &[disabled] {
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    cursor: not-allowed;
  }

  &:disabled:hover,
  &[disabled]:hover {
    background-color: ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.inverse};
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  }
`;

const ErrorButton = styled(Button)`
  color: ${(props) => props.theme.colors.error?.default};
  background-color: ${(props) => props.theme.colors.error?.default10};
  border: ${(props) => (props.$primary ? 'none' : `none`)};
  &:hover {
    background-color: ${(props) => props.theme.colors.error?.hover};
    color: ${(props) => props.theme.colors.error?.default};
    border: ${(props) => (props.$primary ? 'none' : `none`)};
  }
`;

const ButtonText = styled.span`
  margin-left: 1rem;
`;

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  background-color: ${(props) => props.theme.colors.background?.inverse};
  color: ${(props) => props.theme.colors.text?.inverse};
  font-weight: bold;
  padding: 1.2rem;
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    <ButtonText>Install MetaMask Flask</ButtonText>
  </Link>
);

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <>
      <ErrorButton {...props}>
        <ButtonText>Connect</ButtonText>
      </ErrorButton>
      <Button $primary {...props}>
        <ButtonText>Connect</ButtonText>
      </Button>
      <Button {...props}>
        <ButtonText>Connect</ButtonText>
      </Button>
    </>
  );
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <>
      <Button {...props}>
        <ButtonText>Reconnect</ButtonText>
      </Button>
      <Button $primary {...props}>
        <ButtonText>Reconnect</ButtonText>
      </Button>
    </>
  );
};

export const SendHelloButton = (props: ComponentProps<typeof Button>) => {
  return <Button {...props}>Send message</Button>;
};

export const HeaderButtons = () => {
  const requestSnap = useRequestSnap();
  const { isFlask, installedSnap } = useMetaMask();

  if (!isFlask && !installedSnap) {
    return <InstallFlaskButton />;
  }

  if (!installedSnap) {
    return <ConnectButton onClick={requestSnap} />;
  }

  if (shouldDisplayReconnectButton(installedSnap)) {
    return <ReconnectButton onClick={requestSnap} />;
  }

  return (
    <ConnectedContainer>
      <ButtonText>Connected</ButtonText>
    </ConnectedContainer>
  );
};
