import type { ComponentProps } from 'react';
import styled from 'styled-components';

import { useMetaMask, useRequestSnap } from '../../hooks';
import { shouldDisplayReconnectButton } from '../../utils';

const Button = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  background-color: 'red';
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

const ButtonPrimary = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  border-radius: 48px;
  padding: 1rem 2rem;
  color: white;
  font-weight: bold;
  border: none;
  background-color: ${(props) => props.theme.colors.primary?.default};
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
  &:hover {
    background-color: ${(props) => props.theme.colors.primary?.hover};
    color: white;
    border: none;
  }
`;

const ButtonSecondary = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  border-radius: 48px;
  padding: 1rem 2rem;
  color: ${(props) => props.theme.colors.primary?.default};
  font-weight: bold;
  border: 1px solid ${(props) => props.theme.colors.primary?.default};
  background-color: transparent;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
  &:hover {
    background-color: ${(props) => props.theme.colors.secondary?.default10};
    color: ${(props) => props.theme.colors.primary?.default};
    border: 1px solid ${(props) => props.theme.colors.primary?.default};
  }
`;

const ButtonError = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  border-radius: 48px;
  padding: 1rem 2rem;
  color: ${(props) => props.theme.colors.error?.default};
  font-weight: bold;
  border: none;
  background-color: ${(props) => props.theme.colors.error?.default10};
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
  &:hover {
    background-color: ${(props) => props.theme.colors.error?.hover};
    color: ${(props) => props.theme.colors.error?.default};
    border: none;
  }
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

const ConnectedIndicator = styled.div`
  content: ' ';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: green;
`;

export const InstallFlaskButton = (
  props: ComponentProps<typeof ButtonSecondary>,
) => <ButtonError {...props}>Install MetaMask Flask</ButtonError>;

export const ConnectButton = (
  props: ComponentProps<typeof ButtonSecondary>,
) => {
  return (
    <ButtonSecondary {...props}>
      {/* <FlaskFox /> */}
      Connect
    </ButtonSecondary>
  );
};

export const ReconnectButton = (
  props: ComponentProps<typeof ButtonPrimary>,
) => {
  return <ButtonPrimary {...props}>Reconnect</ButtonPrimary>;
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
      <ConnectedIndicator />
      Connected
    </ConnectedContainer>
  );
};
