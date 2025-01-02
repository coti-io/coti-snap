/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import styled from 'styled-components';

import { DeleteAESKey } from './DeleteAESKey';
import { ManageAESKey } from './ManageAESKey';
import { OnboardAccount } from './OnboardAccount';

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: left;
  padding: 80px;
  gap: 16px;
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    gap: 16px;
    padding: 40px 24px;
  }
`;

export const ContentManageAESKey = ({
  userAESKey,
}: {
  userAESKey: string | null;
}) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleShowDelete = () => {
    setShowDelete(!showDelete);
  };

  return (
    <ContentContainer>
      {userAESKey ? (
        showDelete ? (
          <DeleteAESKey handleShowDelete={handleShowDelete} />
        ) : (
          <ManageAESKey
            handleShowDelete={handleShowDelete}
            userAESKey={userAESKey}
          />
        )
      ) : (
        <OnboardAccount />
      )}
    </ContentContainer>
  );
};
