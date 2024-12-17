import React from 'react';
import styled from 'styled-components';

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 80px;
  width: 100%;
  color: ${(props) => props.theme.colors.text?.default};
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
`;

export const Content = () => {
  return <ContentWrapper>index</ContentWrapper>;
};
