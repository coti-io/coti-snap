import styled from 'styled-components';

import { ReactComponent as COTILogo } from '../../assets/logo.svg';
import { HeaderButtons } from './HeaderButtons';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const Header = () => {
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <COTILogo />
        <Title>COTI</Title>
      </LogoWrapper>
      <ButtonsContainer>
        <HeaderButtons />
      </ButtonsContainer>
    </HeaderWrapper>
  );
};
