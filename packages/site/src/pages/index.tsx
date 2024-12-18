import styled from 'styled-components';

import { ContentConnectYourWallet, Header } from '../components';
// import { defaultSnapOrigin } from '../config';
// import {
//   useMetaMask,
//   useInvokeSnap,
//   useMetaMaskContext,
//   useRequestSnap,
// } from '../hooks';
// import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  gap: 24px;
  box-sizing: border-box;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 1.6rem;
    margin: 0;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

const Index = () => {
  // const { error } = useMetaMaskContext();
  // const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  // const requestSnap = useRequestSnap();
  // const invokeSnap = useInvokeSnap();

  // const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
  //   ? isFlask
  //   : snapsDetected;

  // const handleSendHelloClick = async () => {
  //   await invokeSnap({ method: 'hello' });
  // };

  return (
    <Container>
      {/* <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.tsx</code>
      </Subtitle> */}

      <Header />
      {/* 
      <ContentManageAESKey />
      <ContentSwitchNetwork />
      */}
      <ContentConnectYourWallet />
      {/* {error && (
        <ErrorMessage>
          <b>An error happened:</b> {error.message}
        </ErrorMessage>
      )} */}
      {/* {!isMetaMaskReady && (
        <Card
          content={{
            title: 'Install',
            description:
              'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
            button: <InstallFlaskButton />,
          }}
          fullWidth
        />
      )} */}
      {/* {!installedSnap && (
        <Card
          content={{
            title: 'Connect',
            description:
              'Get started by connecting to and installing the example snap.',
            button: (
              <ConnectButton
                onClick={requestSnap}
                disabled={!isMetaMaskReady}
              />
            ),
          }}
          disabled={!isMetaMaskReady}
        />
      )} */}
      {/* {shouldDisplayReconnectButton(installedSnap) && (
        <Card
          content={{
            title: 'Reconnect',
            description:
              'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
            button: (
              <ReconnectButton
                onClick={requestSnap}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
        />
      )} */}
      {/* <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        /> */}
      {/* <Notice>
        <p>
          Please note that the <b>snap.manifest.json</b> and <b>package.json</b>{' '}
          must be located in the server root directory and the bundle must be
          hosted at the location specified by the location field.
        </p>
      </Notice> */}
    </Container>
  );
};

export default Index;
