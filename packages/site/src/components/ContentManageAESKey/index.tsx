import React from 'react';
import styled from 'styled-components';

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

export const ContentManageAESKey = () => {
  return (
    <ContentContainer>
      {/*
      <DeleteAESKey />
      <ManageAESKey />
      */}
      <OnboardAccount />
    </ContentContainer>
  );
};
