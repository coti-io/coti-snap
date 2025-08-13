import COTILogo from '../../assets/logo.svg';
import { HeaderButtons } from './HeaderButtons';
import { MobileMenu } from './MobileMenu';
import {
  ButtonsContainer,
  HeaderWrapper,
  LogoWrapper,
} from './styles';

export const Header = () => {
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <COTILogo />
      </LogoWrapper>
      <ButtonsContainer>
        <HeaderButtons />
      </ButtonsContainer>
      <MobileMenu />
    </HeaderWrapper>
  );
};
