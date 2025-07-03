import './App.css';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import {
  ContentConnectYourWallet,
  ContentManageAESKey,
  ContentSwitchNetwork,
  Header,
} from './components';
import { ContentInstallAESKeyManager } from './components/ContentInstallAESKeyManager';
import { useMetaMask, useWrongChain } from './hooks';
import { useSnap } from './hooks/SnapContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  max-height: 100vh;
  margin-top: 20px;
  max-height: calc(100vh - 120px);
  gap: 24px;
  box-sizing: border-box;
  border-radius: 14px;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 1.6rem;
    margin: 0;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

function App() {
  const { installedSnap } = useMetaMask();

  const { userHasAESKey, userAESKey } = useSnap();
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();

  if (isConnected && wrongChain) {
    <ContentSwitchNetwork />;
  }

  return (
    <Container>
      <Header />
      {isConnected ? (
        wrongChain ? (
          <ContentSwitchNetwork />
        ) : installedSnap ? (
          <ContentManageAESKey userHasAESKey={userHasAESKey} userAESKey={userAESKey} />
        ) : (
          <ContentInstallAESKeyManager />
        )
      ) : (
        <ContentConnectYourWallet />
      )}
    </Container>
  );
}

export default App;
