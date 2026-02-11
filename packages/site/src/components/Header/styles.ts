import styled from 'styled-components';

// ---------- index.tsx
export const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 48px;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  @media screen and (max-width: 992px) {
    padding: 14px 32px;
  }

  @media screen and (max-width: 768px) {
    padding: 12px 24px;
  }

  ${({ theme }) => theme.mediaQueries.small} {
    padding: 12px 16px;
    gap: 8px;
  }

  /* Smooth scrolling effect */
  &.scrolled {
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 48px;

    @media screen and (max-width: 992px) {
      padding: 10px 32px;
    }

    @media screen and (max-width: 768px) {
      padding: 10px 24px;
    }

    ${({ theme }) => theme.mediaQueries.small} {
      padding: 10px 16px;
    }
  }
`;

export const ContentTitle = styled.p`
  font-size: 2.4rem;
  font-weight: bold;
  margin: 0;
`;

export const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    height: 44px;
    width: auto;
    transition: all 0.3s ease;
  }

  @media screen and (max-width: 992px) {
    svg {
      height: 40px;
    }
  }

  @media screen and (max-width: 768px) {
    svg {
      height: 36px;
    }
  }

  ${({ theme }) => theme.mediaQueries.small} {
    svg {
      height: 32px;
    }
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media screen and (max-width: 768px) {
    gap: 8px;
  }

  @media screen and (max-width: 770px) {
    display: none;
  }

  @media screen and (max-height: 820px) {
    display: none;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 10px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1001;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.2);
  }

  @media screen and (max-width: 770px) {
    display: flex;
  }

  @media screen and (max-height: 820px) {
    display: flex;
  }

  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }
`;

export const MobileMenuDropdown = styled.div<{ $isVisible: boolean }>`
  display: flex;
  position: fixed;
  top: 68px;
  left: 50%;
  flex-direction: column;
  align-items: stretch;
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 16px;
  box-shadow:
    0px 12px 40px rgba(0, 0, 0, 0.4),
    0px 0px 1px rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 999;
  gap: 12px;
  min-width: 280px;
  max-width: calc(100vw - 32px);

  opacity: ${(props) => (props.$isVisible ? '1' : '0')};
  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
  transform: ${(props) =>
    props.$isVisible
      ? 'translateX(-50%) translateY(0) scale(1)'
      : 'translateX(-50%) translateY(-12px) scale(0.95)'};
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;

  contain: layout style;
  will-change: transform, opacity;

  @media screen and (max-width: 770px) {
    display: flex;
    min-width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
    top: 60px;
  }

  @media screen and (max-height: 820px) {
    display: flex;
    top: 60px;
  }

  @media screen and (min-width: 771px) and (min-height: 821px) {
    display: none;
  }
`;

export const MobileAddressDisplay = styled.div`
  padding: 12px 16px;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  align-items: center;
  text-align: center;
  background-color: #2a3441;
  border-radius: ${({ theme }) => theme.radii.button};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.default};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MobileConnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: rgb(42, 52, 65);
  color: #ffffff;
  border: none;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.default};
  padding: 12px 40px;
  min-height: 4.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgb(52, 62, 75);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: rgb(32, 42, 55);
    opacity: 0.7;
  }
`;

export const MobileInstallLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: #2a3441;
  color: #ffffff;
  border: none;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.default};
  padding: 12px 40px;
  min-height: 4.2rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #3a4451;
    color: #ffffff;
  }
`;

// ---------- WalletManager.tsx

export const Dropdown = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 10px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: ${({ theme }) => theme.radii.default};
  z-index: 10;
  gap: 8px;
  margin-top: 10px;
  min-width: 160px;

  opacity: ${(props) => (props.$isVisible ? '1' : '0')};
  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
  transform: ${(props) =>
    props.$isVisible
      ? 'translateY(0) scale(1)'
      : 'translateY(-10px) scale(0.95)'};
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  contain: layout style;
  will-change: transform, opacity;
`;

export const DisconnectButton = styled.button<{ $padding?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: #ff1900;
  color: #ffffff;
  border: none;
  gap: 2px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.default};
  padding: ${(props) => props.$padding || '12px 40px'};
  min-height: 4.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e55a5a;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: #d4a4a4;
    opacity: 0.7;
  }
`;

export const ConnectedDetails = styled.div<{
  $wrongChain: boolean;
  $padding?: string;
}>`
  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.$padding || '10px 20px'};
  gap: 6px;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  border-radius: 24px;
  background-color: ${(props) =>
    props.$wrongChain ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.15)'};
  color: #ffffff;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  border: 1px solid
    ${(props) =>
      props.$wrongChain
        ? 'rgba(239, 68, 68, 0.5)'
        : 'rgba(255, 255, 255, 0.2)'};
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:hover {
    background-color: ${(props) =>
      props.$wrongChain ? 'rgba(239, 68, 68, 1)' : 'rgba(255, 255, 255, 0.25)'};
    border-color: ${(props) =>
      props.$wrongChain
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media screen and (max-width: 768px) {
    font-size: 13px;
    padding: ${(props) => props.$padding || '8px 16px'};
    gap: 4px;
  }

  ${({ theme }) => theme.mediaQueries.small} {
    font-size: 12px;
    padding: ${(props) => props.$padding || '8px 14px'};
  }
`;

// ---------- HeaderButtons.tsx

export const Link = styled.a`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: none;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.default};
  flex: none;
  padding: 12px 40px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border: none;
    color: #ffffff;
  }

  &:disabled {
    border: none;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    opacity: 0.5;
  }
`;

export const LinkTransparent = styled.a`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: transparent;
  color: #ffffff;
  border: none;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.default};
  flex: none;
  padding: 8px 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ffffff;
  }

  &:disabled {
    border: none;
    cursor: not-allowed;
    background-color: transparent;
    color: #ffffff;
    opacity: 0.5;
  }
`;

export const ConnectedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;

  @media screen and (max-height: 820px) {
    display: none;
  }
`;
