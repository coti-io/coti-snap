import COTILogo from '../../assets/logo.svg';
import { HeaderButtons } from './HeaderButtons';
import {
  ContentTitle,
  ButtonsContainer,
  HeaderWrapper,
  LogoWrapper,
} from './styles';

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
