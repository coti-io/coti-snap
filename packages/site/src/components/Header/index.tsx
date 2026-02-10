import { HeaderButtons } from './HeaderButtons';
import { MobileMenu } from './MobileMenu';
import {
  ButtonsContainer,
  HeaderWrapper,
  LinkTransparent,
  LogoWrapper,
} from './styles';
import COTILogo from '../../assets/logo.svg';

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
