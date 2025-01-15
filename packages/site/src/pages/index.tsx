import styled from 'styled-components';

import { ContentManageAESKey, Header } from '../components';
import { ContentInstallAESKeyManager } from '../components/ContentInstallAESKeyManager';
import { useMetaMask } from '../hooks';
import { useSnap } from '../hooks/SnapContext';

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
  const { installedSnap } = useMetaMask();

  const { userHasAESKey } = useSnap();

  return (
    <Container>
      <Header />
      {installedSnap ? (
        <ContentManageAESKey userHasAESKey={userHasAESKey} />
      ) : (
        <ContentInstallAESKeyManager />
      )}
    </Container>
  );
};

export default Index;
