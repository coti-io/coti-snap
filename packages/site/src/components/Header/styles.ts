import styled from 'styled-components';

// ---------- index.tsx
export const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  width: auto;
  position: relative;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
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
  gap: 8px;
  cursor: pointer;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  align-items: center;
  justify-content: center;
  position: relative;
  
  ${({ theme }) => theme.mediaQueries.small} {
    display: flex;
  }
  
  img {
    width: 24px;
    height: 24px;
  }
`;

export const MobileMenuDropdown = styled.div<{ $isVisible: boolean }>`
  display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
  position: absolute;
  top: 100%;
  right: 0;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 16px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: ${({ theme }) => theme.radii.default};
  z-index: 20;
  gap: 12px;
  margin-top: 10px;
  min-width: 200px;
  
  ${({ theme }) => theme.mediaQueries.small} {
    display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
  }
  
  @media screen and (min-width: 601px) {
    display: none;
  }
`;

export const MobileAddressDisplay = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  background-color: #2a3441;
  border-radius: ${({ theme }) => theme.radii.button};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
  color: #FFFFFF;
  font-family: 'Sofia Pro';
`;

export const MobileConnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: rgb(42, 52, 65);
  color: #FFFFFF;
  border: none;
  font-weight: 500;
  font-family: 'Sofia Pro';
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
  color: #FFFFFF;
  border: none;
  font-weight: 500;
  font-family: 'Sofia Pro';
  padding: 12px 40px;
  min-height: 4.2rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #3a4451;
    color: #FFFFFF;
  }
`;

// ---------- WalletManager.tsx

export const Dropdown = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 10px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: ${({ theme }) => theme.radii.default};
  z-index: 10;
  gap: 8px;
  margin-top: 10px;
`;

export const DisconnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: #ff1900;
  color: #FFFFFF;
  border: none;
  font-weight: 500;
  font-family: 'Sofia Pro';
  padding: 12px 40px;
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

export const ConnectedDetails = styled.div<{ $wrongChain: boolean }>`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 12px 40px;
  gap: 4px;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: 400;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: ${(props) =>
    props.$wrongChain
      ? '#ff1900'
      : 'rgba(255, 255, 255, 0.15)'};
  color: #FFFFFF;
  margin-top: auto;
  margin-bottom: auto;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: ${(props) =>
    props.$wrongChain
      ? '#e55a5a;'
      : 'rgba(255, 255, 255, 0.25)'};
`;

// ---------- HeaderButtons.tsx

export const Link = styled.a`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  border: none;
  font-weight: 500;
  font-family: 'Sofia Pro';
  flex: none;
  padding: 12px 40px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border: none;
    color: #FFFFFF;
  }

  &:disabled {
    border: none;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    opacity: 0.5;
  }
`;

export const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  gap: 8px;
  justify-items: center;
  justify-items: center;
`;
