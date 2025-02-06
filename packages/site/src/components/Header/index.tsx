import COTILogo from '../../assets/logo.svg';
import { ContentTitle } from './styles';
import { HeaderButtons } from './HeaderButtons';
import { ButtonsContainer, HeaderWrapper, LogoWrapper } from './styles';

export const Header = () => {
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <COTILogo />
        <ContentTitle>COTI</ContentTitle>
      </LogoWrapper>
      <ButtonsContainer>
        <HeaderButtons />
      </ButtonsContainer>
    </HeaderWrapper>
  );
};
