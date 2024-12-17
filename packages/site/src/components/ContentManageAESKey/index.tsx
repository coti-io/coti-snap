import React from 'react';
import styled from 'styled-components';

import { DeleteAESKey } from './DeleteAESKey';

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
`;

export const ContentManageAESKey = () => {
  return (
    <ContentContainer>
      {/*
      <OnboardAccount />
      <ManageAESKey />
       */}
      <DeleteAESKey />
    </ContentContainer>
  );
};
