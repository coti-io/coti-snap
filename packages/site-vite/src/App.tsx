import './App.css'
import styled from 'styled-components';
import { ContentManageAESKey, ContentSwitchNetwork, Header } from './components';
import { useMetaMask, useWrongChain } from './hooks';
import { useSnap } from './hooks/SnapContext';
import { useAccount } from 'wagmi';
import { ContentInstallAESKeyManager } from './components/ContentInstallAESKeyManager';

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

function App() {
  const { installedSnap } = useMetaMask();

  const { userHasAESKey } = useSnap();
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();

  if (isConnected && wrongChain) {
    <ContentSwitchNetwork />;
  }

  return (
<Container>
  <Header />
  {isConnected && wrongChain ? (
        <ContentSwitchNetwork />
      ) : installedSnap ? (
        <ContentManageAESKey userHasAESKey={userHasAESKey} />
      ) : (
        <ContentInstallAESKeyManager />
      )}
</Container>
  )
}

export default App
