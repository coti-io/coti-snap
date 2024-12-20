// import { defaultSnapOrigin } from '../config';
// import {
//   useMetaMask,
//   useInvokeSnap,
//   useMetaMaskContext,
//   useRequestSnap,
// } from '../hooks';
// import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';
import { useEffect, useState } from 'react';
import { truncateString } from 'src/utils';
import styled from 'styled-components';
import { useAccount, useConnect } from 'wagmi';

import { Button } from '../Button';

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

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ConnectedDetails = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 1px 20px;
  height: 31px;
  gap: 4px;
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: 400;
  border-radius: ${(props) => props.theme.radii.small};
  background-color: ${(props) => props.theme.colors.secondary?.default10};
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    Install MetaMask Flask
  </Link>
);

export const SendHelloButton = () => {
  return <Button text="Send message" />;
};

export const HeaderButtons = () => {
  // const requestSnap = useRequestSnap();
  // const { isFlask, installedSnap } = useMetaMask();

  // if (!isFlask && !installedSnap) {
  //   return <InstallFlaskButton />;
  // }

  // if (!installedSnap) {
  //   return <Button text="Connect" primary onClick={requestSnap} />;
  // }

  // if (shouldDisplayReconnectButton(installedSnap)) {
  //   return <Button text="Reconnect" primary onClick={requestSnap} />;
  // }

  const { address } = useAccount();
  const { connectors, connect } = useConnect();

  const [truncateAddress, setTruncateAddress] = useState<string>('');

  useEffect(() => {
    if (address) {
      const tAddress = truncateString(address);
      setTruncateAddress(tAddress);
    }
  }, [address]);

  if (!address) {
    return (
      <ConnectedContainer>
        <ConnectedDetails>{address ?? 'no address'}</ConnectedDetails>
        {connectors.map((connector) => (
          <Button
            text={connector.name}
            primary
            onClick={() => connect({ connector })}
          />
        ))}
      </ConnectedContainer>
    );
  }

  return (
    <ConnectedContainer>
      <ConnectedDetails>
        {address ? truncateAddress : 'no address'}
      </ConnectedDetails>
      <ConnectedDetails>
        Network
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_608_2076)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.6 8.59961L12 13.1996L7.4 8.59961L6 9.99961L12 15.9996L18 9.99961L16.6 8.59961Z"
              fill="#11DEB3"
            />
          </g>
          <defs>
            <clipPath id="clip0_608_2076">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </ConnectedDetails>
    </ConnectedContainer>
  );
};
