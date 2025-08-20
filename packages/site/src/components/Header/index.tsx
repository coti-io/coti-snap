import COTILogo from '../../assets/logo.svg';
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
        <LinkTransparent href={COTI_SITE} target="_blank" rel="noopener noreferrer">
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
