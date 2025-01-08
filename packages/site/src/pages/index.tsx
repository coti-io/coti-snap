import styled from 'styled-components';

import { Button, ContentManageAESKey, Header } from '../components';
import { useMetaMask, useRequestSnap } from '../hooks';
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

  const requestSnap = useRequestSnap();
  const { userHasAESKey } = useSnap();

  return (
    <Container>
      <Header />
      {installedSnap ? (
        <ContentManageAESKey userHasAESKey={userHasAESKey} />
      ) : (
        <Button text="Install snap" primary onClick={requestSnap} />
      )}
    </Container>
  );
};

export default Index;
