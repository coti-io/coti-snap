import styled from 'styled-components';
import { useAccount, useConnect } from 'wagmi';

// import { defaultSnapOrigin } from '../../config';
import {
  useMetaMask,
  // useInvokeSnap,
  // useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
// import { isLocalSnap, shouldDisplayReconnectButton } from '../../utils';
import { Button } from '../Button';

const Link = styled.a`
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  background-color: ${(props) => props.theme.colors.primary?.default};
  color: ${(props) => props.theme.colors.primary?.inverse};
  border: 'none';
  font-weight: 500;
  font-size: 'Sofia Pro';
  flex: 'none';
  padding: 12px 40px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary?.hover};
    border: 'none';
    color: ${(props) => props.theme.colors.primary?.inverse};
  }

  &:disabled {
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.inverse};
  }
`;

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  gap: 8px;
  justify-items: center;
  justify-items: center;
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
  margin-top: auto;
  margin-bottom: auto;
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    Install MetaMask Flask
  </Link>
);

export const HeaderButtons = () => {
  const requestSnap = useRequestSnap();
  const { isFlask, installedSnap } = useMetaMask();

  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  const truncateString = (str: string): string => {
    if (str.length <= 10) {
      return str;
    }
    const firstFive = str.slice(0, 5);
    const lastFive = str.slice(-5);
    return `${firstFive}...${lastFive}`;
  };

  // if (!isFlask && !installedSnap) {
  //   return <InstallFlaskButton />;
  // }

  // if (shouldDisplayReconnectButton(installedSnap)) {
  //   return <Button text="Reconnect" primary onClick={requestSnap} />;
  // }

  return (
    <ConnectedContainer>
      {isConnected ? (
        <>
          {!installedSnap && (
            <Button text="Install snap" primary onClick={requestSnap} />
          )}
          <ConnectedDetails>
            {address ? truncateString(address) : 'no address'}
          </ConnectedDetails>
          <ConnectedDetails>
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
        </>
      ) : (
        <>
          {!isFlask && !installedSnap ? (
            <InstallFlaskButton />
          ) : (
            connectors.map(
              (connector) =>
                connector.id === 'io.metamask.flask' && (
                  <Button
                    text="Connect wallet"
                    primary
                    onClick={() => connect({ connector })}
                  />
                ),
            )
          )}
        </>
      )}
    </ConnectedContainer>
  );
};
