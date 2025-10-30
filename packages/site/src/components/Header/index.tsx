import COTILogo from '../../assets/logo.svg';
import { HeaderButtons } from './HeaderButtons';
import { MobileMenu } from './MobileMenu';
import {
  ButtonsContainer,
  HeaderWrapper,
  LinkTransparent,
  LogoWrapper,
} from './styles';

export const Header = () => {
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <LinkTransparent rel="noopener noreferrer">
          <COTILogo />
        </LinkTransparent>
      </LogoWrapper>
      <ButtonsContainer>
        <HeaderButtons />
      </ButtonsContainer>
      <MobileMenu />
    </HeaderWrapper>
  );
};

export { AddressDisplay } from './AddressDisplay';
