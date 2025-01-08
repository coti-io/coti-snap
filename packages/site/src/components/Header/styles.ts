import styled from 'styled-components';

// ---------- index.tsx
export const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }
`;

export const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

// ---------- WalletManager.tsx

export const Dropdown = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.background?.content};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  border-radius: ${({ theme }) => theme.radii.default};
  z-index: 10;
  gap: 8px;
  margin-top: 10px;
`;

export const ConnectedDetails = styled.div<{ $wrongChain: boolean }>`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 1px 20px;
  height: 31px;
  gap: 4px;
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: 400;
  border-radius: ${(props) => props.theme.radii.small};
  background-color: ${(props) =>
    props.$wrongChain
      ? props.theme.colors.error?.default10
      : props.theme.colors.secondary?.default10};
  color: ${(props) =>
    props.$wrongChain
      ? props.theme.colors.error?.default
      : props.theme.colors.text?.default};
  margin-top: auto;
  margin-bottom: auto;
  position: relative;
  cursor: pointer;
`;

// ---------- HeaderButtons.tsx

export const Link = styled.a`
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  background-color: ${(props) => props.theme.colors.primary?.default};
  color: ${(props) => props.theme.colors.primary?.inverse};
  border: 'none';
  font-weight: 500;
  font-size: 'Sofia Pro';
  flex: 'none';
  padding: 12px 40px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary?.hover};
    border: 'none';
    color: ${(props) => props.theme.colors.primary?.inverse};
  }

  &:disabled {
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.inverse};
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
