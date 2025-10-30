import COTILogo from '../../assets/snap.svg';
import { HeaderButtons } from './HeaderButtons';
import { MobileMenu } from './MobileMenu';
import {
  ButtonsContainer,
  HeaderWrapper,
  LinkTransparent,
  LogoWrapper,
} from './styles';
import { COTI_SITE } from "../../config/onboard";

export const Header = () => {
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <LinkTransparent target="_blank" rel="noopener noreferrer">
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
