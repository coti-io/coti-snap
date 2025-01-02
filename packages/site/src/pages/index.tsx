/* eslint-disable no-nested-ternary */
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import {
  Button,
  ContentManageAESKey,
  Header,
  TestContent,
} from '../components';
import { useInvokeSnap, useMetaMask, useRequestSnap } from '../hooks';

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
  const invokeSnap = useInvokeSnap();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);

  const getAESKey = async () => {
    const result = await invokeSnap({
      method: 'get-aes-key',
    });

    if (result !== null) {
      setUserAesKEY(result as string);
    }
  };

  // getAESKey().catch((error) => {
  //   console.error('Error in getAESKey', error);
  // });

  useEffect(() => {
    if (installedSnap) {
      getAESKey().catch((error) => {
        console.error('Error in getAESKey', error);
      });
    }
  }, [installedSnap]);

  return (
    <Container>
      <Header />
      {installedSnap ? (
        <>
          <ContentManageAESKey userAESKey={userAESKey} />
          <TestContent userAESKey={userAESKey} />
        </>
      ) : (
        <Button text="Install snap" primary onClick={requestSnap} />
      )}
    </Container>
  );
};

export default Index;
