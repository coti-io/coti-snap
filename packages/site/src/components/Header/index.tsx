import { ReactComponent as COTILogo } from '../../assets/logo.svg';
import { HeaderButtons } from './HeaderButtons';
import { ButtonsContainer, HeaderWrapper, LogoWrapper, Title } from './styles';

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
