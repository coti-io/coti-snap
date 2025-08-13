import styled, { keyframes } from 'styled-components';

const slideUpFadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(48px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const colors = {
  primary: '#1E29F6',
  primaryHover: '#3350e6',
  primaryDark: '#2946c7',
  secondary: '#3d5afe',
  secondaryHover: '#2946c7',
  success: '#10b981',
  successHover: '#059669',
  error: '#e53935',
  text: {
    primary: '#18191d',
    secondary: '#6b7280',
    tertiary: '#8a8f98',
    muted: '#bfc2c6',
    light: '#9ca3af'
  },
  background: {
    primary: '#fff',
    secondary: '#f7f7f7',
    tertiary: '#f3f5fa',
    success: '#ecfdf5',
    hover: '#f8fafc'
  },
  border: {
    primary: '#e5e7eb',
    secondary: '#d0d0d0'
  }
} as const;

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  xxxxl: '40px'
} as const;

const typography = {
  sizes: {
    xs: '1.1rem',
    sm: '1.2rem',
    base: '1.4rem',
    md: '1.5rem',
    lg: '1.6rem',
    xl: '1.7rem',
    xxl: '1.8rem',
    xxxl: '2rem',
    xxxxl: '2.1rem',
    xxxxxl: '2.4rem',
    huge: '3.4rem'
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const;

const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  xxxxl: '24px',
  full: '50%'
} as const;

const shadows = {
  sm: '0 1px 4px rgba(0,0,0,0.04)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 32px 0 rgba(0,0,0,0.12)',
  dropdown: '0 2px 12px rgba(0,0,0,0.10)'
} as const;

const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.32s cubic-bezier(0.4, 0.8, 0.4, 1)'
} as const;

const buttonBase = `
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: ${typography.weights.semibold};
  transition: all ${transitions.normal};
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const buttonBaseAction = `
  outline: none;
  cursor: pointer;
  font-weight: ${typography.weights.semibold};
  transition: all ${transitions.normal};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const inputBase = `
  border: 1.5px solid ${colors.border.primary};
  border-radius: ${borderRadius.md};
  font-size: ${typography.sizes.lg};
  color: #000000 !important;
  background: ${colors.background.secondary};
  outline: none;
  transition: border-color ${transitions.fast}, background-color ${transitions.fast};
  
  &:focus {
    border-color: ${colors.primary};
    background: ${colors.background.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const MainStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxxl};
`;

export const QuickAccessGroup = styled.nav`
  display: flex;
  gap: ${spacing.xxl};
  justify-content: center;
  align-items: flex-center;
`;

export const QuickAccessItem = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md};
`;

export const QuickAccessButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.full};
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.background.primary};
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.xs};
  ${buttonBase}
  
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }
  
  svg {
    width: ${spacing.xl};
    height: ${spacing.xl};
    color: ${colors.background.primary};
    stroke: ${colors.background.primary};
    fill: none;
    stroke-width: 2.2;
  }
`;

export const QuickAccessLabel = styled.span`
  color: #000000 !important;
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.normal};
  text-align: center;
  font-weight: 450;
`;


export const BalanceEye = styled.button`
  background: none;
  padding: 0;
  margin-left: ${spacing.xs};
  display: flex;
  align-items: center;
  ${buttonBase}
  
  svg {
    width: 22px;
    height: 22px;
    color: ${colors.text.muted};
    stroke: ${colors.text.muted};
    fill: ${colors.background.primary};
  }
`;

export const BalanceSub = styled.div`
  font-size: ${typography.sizes.sm};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.normal};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

export const BalancePortfolioLink = styled.a`
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: ${typography.sizes.xxl};
  line-height: 1;
  vertical-align: middle;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const BalancePortfolioIcon = styled.span`
  display: flex;
  align-items: center;
  height: ${typography.sizes.xxl};
  
  svg {
    width: ${typography.sizes.xxl};
    height: ${typography.sizes.xxl};
    color: ${colors.primary};
    stroke: ${colors.primary};
    fill: none;
    stroke-width: 2.2;
    display: block;
  }
`;

export const BalanceChange = styled.span`
  color: ${colors.text.muted};
  font-size: ${typography.sizes.xxl};
  font-weight: ${typography.weights.normal};
  margin-right: ${spacing.sm};
`;

export const TabsWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border.primary};
  width: 100%;
  justify-content: center;
`;

export const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active: boolean }>`
  background: none;
  border: none;
  outline: none;
  font-size: ${typography.sizes.xl};
  font-weight: ${({ active }) => (active ? typography.weights.normal : typography.weights.normal)};
  color: ${({ active }) => (active ? colors.text.primary : "#071550")};
  border-bottom: 2px solid ${({ active }) => (active ? "#1E29F6" : colors.border.primary)};
  padding: 0 ${spacing.xl} ${spacing.lg} ${spacing.xl};
  cursor: pointer;
  transition: color ${transitions.normal}, border-bottom ${transitions.normal};
  flex: 1;
  text-align: center;
`;

export const CenteredTabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${spacing.lg};
  width: 100%;
`;

export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${spacing.sm} 0 0 0;
`;

export const NetworkBadge = styled.div`
  background: none;
  color: #000000 !important;
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.medium};
  border-radius: ${spacing.lg};
  padding: ${spacing.sm};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: background ${transitions.fast};
  cursor: pointer;
  
  &:hover {
    background: ${colors.background.tertiary};
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xxl};
`;

export const IconButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>`
  background: ${({ selected }) => (selected ? colors.background.tertiary : 'none')};
  border: none;
  padding: ${spacing.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #000000 !important;
  border-radius: ${spacing.sm};
  transition: background ${transitions.fast};
  
  &:hover {
    background: ${colors.background.tertiary};
  }
`;

export const MenuDropdown = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: ${colors.background.primary};
  box-shadow: ${shadows.dropdown};
  border-radius: ${spacing.lg};
  min-width: 180px;
  z-index: 100;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  width: 100%;
  background: ${colors.background.primary};
  border: none;
  outline: none;
  font-size: ${typography.sizes.lg};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.medium};
  padding: ${spacing.md};
  cursor: pointer;
  transition: background ${transitions.fast};
  
  &:hover {
    background: ${colors.background.secondary};
  }
`;

export const SortDropdown = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: ${colors.background.primary};
  box-shadow: ${shadows.dropdown};
  border-radius: ${spacing.lg};
  min-width: 270px;
  z-index: 101;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const SortOption = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${({ selected }) => (selected ? '#eef1ff' : colors.background.primary)};
  border: none;
  outline: none;
  font-size: ${typography.sizes.lg};
  color: #000000 !important;
  font-weight: ${typography.weights.medium};
  padding: ${spacing.md};
  cursor: pointer;
  transition: background ${transitions.fast};
  position: relative;
  gap: ${spacing.lg};
  
  &:hover {
    background: ${({ selected }) => (selected ? '#eef1ff' : colors.background.secondary)};
  }
  
  &::before {
    content: '';
    display: ${({ selected }) => (selected ? 'block' : 'none')};
    position: absolute;
    left: 0;
    top: ${spacing.sm};
    bottom: ${spacing.sm};
    width: ${spacing.xs};
    border-radius: ${spacing.xs};
    background: ${colors.primary};
  }
`;

export const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  min-height: 80px;
  cursor: pointer;
  
  &:hover {
    background: ${colors.background.secondary};
  }
`;

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  
  &:hover {
    cursor: pointer;
  }
`;

export const TokenLogos = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  
  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
  }
`;

export const TokenLogoBig = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.xl};
  color: #000000 !important;
  font-weight: ${typography.weights.medium};
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  
  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

export const TokenLogoSmall = styled.div`
  width: 18px;
  height: 18px;
  background: ${colors.background.primary};
  border-radius: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.base};
  color: #000000 !important;
  font-weight: ${typography.weights.medium};
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 2;
  border: 2px solid ${colors.border.primary};
  box-shadow: ${shadows.sm};
`;

export const TokenName = styled.span`
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.bold};
  color: #000000 !important;
  
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

export const TokenValues = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 110px;
  text-align: right;
`;

export const TokenUsd = styled.span`
  font-size: ${typography.sizes.xxxxl};
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  line-height: 1.1;
`;

export const TokenAmount = styled.span`
  font-size: 16px;
  font-weight: ${typography.weights.bold};
  color: #1F2D67 !important;
  letter-spacing: 0.01em;
  white-space: nowrap;
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.xxxl};
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const NFTCard = styled.div`
  background: ${colors.background.tertiary};
  border-radius: ${spacing.lg};
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  cursor: pointer;
`;

export const NFTCardImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.9;
`;

export const NFTLogo = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 22px;
  height: 22px;
  background: ${colors.background.primary};
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.medium};
  box-shadow: ${shadows.sm};
  border: 1.5px solid ${colors.border.primary};
`;

export const TransferContainer = styled.div`
  box-shadow: none;
  padding: 0 ${spacing.lg};
  background: none;
  
  @media (max-width: 600px) {
    padding: 0 ${spacing.md};
  }
`;

export const TransferContainerMain = styled.div`
  box-shadow: none;
  padding: 0 ${spacing.lg};
  background: none;
  width: 100%;
  max-width: 100%;
`;

export const SendAmount = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.xs};
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.normal};
  color: #1F2D67 !important;
  
  @media (max-width: 600px) {
    font-size: 14px;
    gap: 2px;
  }
`;

export const AccountBox = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>`
  display: flex;
  align-items: center;
  background: ${colors.background.primary};
  border-radius: ${spacing.lg};
  border: 1.5px solid ${({ active }) => (active ? colors.primary : colors.border.primary)};
  padding: ${spacing.md} ${spacing.xxl};
  gap: ${spacing.md};
  width: 100%;
  margin-bottom: ${spacing.sm};
`;

export const AccountIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  background: linear-gradient(135deg, #ffe14d 60%, ${colors.primary} 40%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.xxxxl};
`;

export const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  color: #000000 !important;
`;

export const AccountName = styled.div`
  font-size: ${typography.sizes.base};
  font-weight: ${typography.weights.semibold};
`;

export const AccountAddress = styled.div`
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.normal};
  color: #1F2D67 !important;
  max-width: 120px;
  text-align: right;
  padding: 0 4px;

  @media (max-width: 600px) {
    max-width: 80px;
    font-size: 14px;
    gap: 2px;
  }
`;

export const DropdownIcon = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

export const InputBox = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.background.primary};
  border-radius: ${spacing.lg};
  border: 1.5px solid ${colors.primary};
  padding: ${spacing.lg} ${spacing.md};
  gap: ${spacing.sm};
  width: 100%;
  margin-bottom: ${spacing.sm};
`;

export const AddressInput = styled.input`
  border: none;
  outline: none;
  font-size: ${typography.sizes.md};
  flex: 1;
  background: transparent;
  color: #000000 !important;
`;

export const ScanButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: ${typography.sizes.xl};
  cursor: pointer;
`;

export const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.lg};
  margin-top: ${spacing.xxxxl};
`;

export const CancelButton = styled.button`
  flex: 1;
  background: none;
  border: 2px solid ${colors.primary};
  color: ${colors.primary};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.xxl};
  padding: ${spacing.lg} 0;
  cursor: pointer;
  transition: background ${transitions.normal}, color ${transitions.normal};
  
  &:hover {
    background: ${colors.background.tertiary};
  }
`;

export const ContinueButton = styled.button`
  flex: 1;
  background: ${colors.primary};
  border: none;
  color: ${colors.background.primary};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.xxl};
  padding: ${spacing.lg} 0;
  cursor: pointer;
  transition: background ${transitions.normal};
  
  &:hover {
    background: ${colors.primaryHover};
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(24, 25, 29, 0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnimatedModalContainer = styled.div`
  background: ${colors.background.primary};
  border-radius: ${borderRadius.xxxxl};
  box-shadow: ${shadows.lg};
  width: 420px;
  max-width: 98vw;
  padding: 0 0 ${spacing.xxxl} 0;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: ${slideUpFadeIn} ${transitions.slow} both;
`;

export const ModalHeader = styled.h2`
  font-size: ${typography.sizes.xxxxl};
  font-weight: ${typography.weights.bold};
  text-align: center;
  padding: ${spacing.xxxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  margin: 0 0 ${spacing.xl} 0;
  color: #000000 !important;
`;

export const ModalClose = styled.button`
  position: absolute;
  top: ${spacing.xxxl};
  right: ${spacing.xxxl};
  background: none;
  border: none;
  font-size: ${typography.sizes.xxxxl};
  color: ${colors.text.primary};
  cursor: pointer;
  transition: background-color ${transitions.fast};
  
  &:hover {
    background: ${colors.background.tertiary};
    border-radius: ${borderRadius.sm};
  }
`;

export const ModalLabel = styled.div`
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.semibold};
  color: #000000 !important;
  margin: ${spacing.sm} 0 0 0;
`;

export const ModalInput = styled.input`
  width: auto;
  padding: ${spacing.md} ${spacing.lg};
  ${inputBase}
`;

export const ErrorMsg = styled.div`
  color: ${colors.error};
  font-size: ${typography.sizes.base};
  margin: ${spacing.sm} 0 0 0;
  min-height: ${typography.sizes.base};
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.md};
`;

export const ModalActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary' && prop !== 'disabled'
})<{ primary?: boolean; disabled?: boolean }>`
  flex: 1;
  background: ${({ primary, disabled }) => {
    if (disabled) return colors.background.tertiary;
    return primary ? colors.secondary : 'none';
  }};
  border: 2px solid ${({ disabled }) => disabled ? colors.background.tertiary : colors.secondary};
  color: ${({ primary, disabled }) => {
    if (disabled) return colors.text.light;
    return primary ? colors.background.primary : colors.secondary;
  }};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.xxxl};
  padding: ${spacing.xxl} 0;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all ${transitions.normal};
  
  &:hover:not(:disabled) {
    background: ${({ primary }) => (primary ? colors.secondaryHover : colors.background.hover)};
    color: ${({ primary }) => (primary ? colors.background.primary : colors.secondaryHover)};
  }
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const DepositBorderWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 9px;
  width: auto;
  
  @media (max-width: 600px) {
    background-color: transparent;
    border-radius: 0;
    padding: 0;
    max-width: 600px;
    height: 100vh;
    min-height: 100vh;
  }
`;

export const DepositModalContainer = styled.div`
  background: ${colors.background.primary};
  border-radius: ${borderRadius.xxxxl};
  box-shadow: ${shadows.lg};
  width: 320px;
  max-width: 320px;
  gap: ${spacing.xxl};
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  @media (max-width: 600px) {
    background: #FFFFFF;
    max-width: 600px;
    border-radius: 0;
    box-shadow: none;
    height: 100vh;
    min-height: 100vh;
    justify-content: flex-start;
  }
`;

export const DepositCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 3rem;
  color: ${colors.text.primary};
  cursor: pointer;
  transition: background-color ${transitions.fast};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${colors.background.tertiary};
    border-radius: ${spacing.sm};
  }
`;

export const DepositHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const DepositHeaderSpacer = styled.div`
  width: 48px;
`;

export const DepositTitle = styled.h2`
  font-size: ${typography.sizes.xxxxxl};
  font-weight: ${typography.weights.bold};
  text-align: center;
  color: #000000 !important;
  margin: 0;
`;

export const DepositQRWrapper = styled.div`
  background: ${colors.background.primary};
  border-radius: ${spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DepositAccountName = styled.div`
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin: 18px 0 6px 0;
  text-align: center;
`;

export const DepositAccountAddress = styled.div`
  font-size: 16px;
  color: #000000 !important;
  font-weight: ${typography.weights.normal};
  text-align: center;
  word-break: break-all;
  line-height: 1.5;
  width: 100%;
`;

export const DepositCopyIconWrapper = styled.span`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const DepositCopyButton = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.lg};
  background: ${colors.primary};
  border: none;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: ${typography.weights.semibold};
  cursor: pointer;
  width: 100%;
  padding: ${spacing.lg} ${spacing.xxxl};
  border-radius: ${borderRadius.md};
`;

export const TabButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active: boolean }>`
  width: 100%;
  background: none;
  border: 2px solid ${colors.primary};
  color: ${({ active }) => (active ? colors.text.primary : colors.text.muted)};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.md} 0;
  margin: ${spacing.xxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  cursor: pointer;
  transition: background ${transitions.normal}, color ${transitions.normal};
  
  &:hover, &:focus {
    background: ${colors.background.tertiary};
    color: ${colors.primary};
  }
`;

export const InfoAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  background: #f5f7ff;
  color: ${colors.text.primary};
  border-left: 5px solid ${colors.primary};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.xxl} ${spacing.lg};
  margin: ${spacing.xxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  font-size: ${typography.sizes.md};
`;

export const InfoIconWrapper = styled.span`
  margin-top: 2px;
  svg {
    width: 22px;
    height: 22px;
    color: ${colors.primary};
  }
`;

export const NetworkSelect = styled.button`
  width: 100%;
  background: ${colors.background.secondary};
  border: 1.5px solid ${colors.border.primary};
  color: ${colors.text.tertiary};
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.medium};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.xxl} ${spacing.lg};
  margin: ${spacing.xxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color ${transitions.fast};
  
  &:hover {
    border-color: ${colors.primary};
  }
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const NextButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'disabled'
})<{ disabled: boolean }>`
  width: calc(100% - 64px);
  margin: ${spacing.xxxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  padding: ${spacing.xxl} 0;
  border-radius: ${borderRadius.xxl};
  background: ${colors.primary};
  color: ${colors.background.primary};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border: none;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background ${transitions.normal}, opacity ${transitions.normal};
  
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const TokenInfoBox = styled.div`
  margin: ${spacing.sm} 0 0 0;
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.sm};
  border: 1.5px solid ${colors.border.primary};
  font-size: ${typography.sizes.md};
  color: ${colors.text.primary};
  background: ${colors.background.secondary};
`;

export const TokenInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TokenInfoValue = styled.span`
  color: #000000 !important;
  font-size: ${typography.sizes.md};
  align-items: center;
`;

export const TokenSummaryBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  margin: ${spacing.xxxl} ${spacing.xxxl} 0 ${spacing.xxxl};
`;

export const TokenSummaryLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.full};
  background: ${colors.background.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.xxxxl};
  color: #000000 !important;
  font-weight: ${typography.weights.bold};
  position: relative;
`;

export const TokenSummaryLogoSmall = styled.div`
  position: absolute;
  left: 28px;
  top: 28px;
  width: 20px;
  height: 20px;
  border-radius: ${borderRadius.full};
  background: ${colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.xs};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.bold};
  border: 2px solid ${colors.border.primary};
`;

export const TokenSummaryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TokenSummaryName = styled.div`
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.bold};
  color: #000000 !important;
`;

export const TokenSummaryAddress = styled.div`
  font-size: ${typography.sizes.md};
  color: ${colors.text.primary};
  word-break: break-all;
`;

export const TokenSummarySymbol = styled.div`
  font-size: ${typography.sizes.md};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.medium};
`;

export const TokenSummaryBalance = styled.div`
  font-size: ${typography.sizes.md};
  color: #B6B6B6 !important;
  font-weight: ${typography.weights.semibold};
  margin-top: ${spacing.sm};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StepActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.lg};
  margin-top: 64px;
  padding: 0 ${spacing.xxl};
`;

export const StepButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary' && prop !== 'disabled'
})<{ primary?: boolean; disabled?: boolean }>`
  flex: 1;
  background: ${({ primary, disabled }) => {
    if (disabled) return colors.background.tertiary;
    return primary ? colors.secondary : 'none';
  }};
  border: 2px solid ${({ disabled }) => disabled ? colors.background.tertiary : colors.secondary};
  color: ${({ primary, disabled }) => {
    if (disabled) return colors.text.light;
    return primary ? colors.background.primary : colors.secondary;
  }};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.xxxl};
  padding: ${spacing.xxl} 0;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all ${transitions.normal};
  
  &:hover:not(:disabled) {
    background: ${({ primary }) => (primary ? colors.secondaryHover : colors.background.hover)};
    color: ${({ primary }) => (primary ? colors.background.primary : colors.secondaryHover)};
  }
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const CenteredText = styled.div`
  text-align: center;
  font-size: ${typography.sizes.xl};
  margin: ${spacing.xxl} 0 0 0;
  font-weight: ${typography.weights.normal};
  color: #000000 !important;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.semibold};
  color: #000000 !important;
  margin-top: ${spacing.md};
`;

export const NFTCornerIcon = styled.div`
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 18px;
  height: 18px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${colors.text.primary};
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 2px solid #fff;
`;

export const NFTDetailsContainer = styled.div`
  background: ${colors.background.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: ${spacing.xxxl};
  width: 100%;
`;

export const DetailsBackButton = styled.button`
  position: absolute;
  left: ${spacing.xs};
  top: ${spacing.xxxl};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  ${buttonBase}
  
  svg {
    width: ${spacing.xxl};
    height: ${spacing.xxl};
    color: ${colors.text.primary};
  }
`;

export const NFTDetailsImageContainer = styled.div`
  margin: 0 auto ${spacing.xxl};
`;

export const NFTDetailsContent = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxl};
`;

export const NFTDetailsRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0;
`;

export const NFTDetailsLabel = styled.span`
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.xl};
  flex: 1;
`;

export const NFTDetailsValue = styled.span`
  color: #1F2D67 !important;
  font-weight: ${typography.weights.bold};
  font-size: ${typography.sizes.xxl};
`;

export const NFTDetailsLink = styled.a`
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.xxl};
  text-decoration: none;
  margin-right: ${spacing.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const NFTDetailsCopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.primary};
  padding: 0;
  ${buttonBase}
  
  svg {
    width: ${spacing.xl};
    height: ${spacing.xl};
  }
`;

export const NFTDetailsDisclaimer = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.sizes.xs};
  margin: 0;
  text-align: left;
  line-height: 1.4;
`;

export const SendButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'backgroundColor' && prop !== 'textColor'
})<{ backgroundColor?: string; textColor?: string }>`
  background: ${({ backgroundColor }) => backgroundColor || '#1E29F6'};
  color: ${({ textColor }) => textColor || '#fff'};
  border-radius: 12px;
  border: 2px solid #1E29F6;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 20px 40px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
  gap: 6px;
  margin-top: ${spacing.xl};
  margin-bottom: 0;
  width: 100%;
  transition: background 0.2s, opacity 0.2s;
  ${buttonBaseAction}
  
  &:hover:not(:disabled) {
    background: ${({ backgroundColor }) => 
      backgroundColor === '#fff' || backgroundColor === 'white' 
        ? '#f8fafc' 
        : backgroundColor ? `${backgroundColor}dd` : '#3350e6'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ backgroundColor }) => backgroundColor || '#1E29F6'};
  }
  
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 16px 32px;
    margin-top: ${spacing.md};
  }
`;

// TokenDetails components
export const TokenDetailsContainer = styled.div`
  background: ${colors.background.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: ${spacing.xxxl};
  gap: ${spacing.xl};
  width: 100%;
`;

export const TokenDetailsBackButtonContainer = styled.div`
  position: absolute;
  left: 0;
  top: ${spacing.xxxl};
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const TokenDetailsBackButton = styled.button`
  position: absolute;
  left: ${spacing.xxl};
  top: ${spacing.xxxl};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  ${buttonBase}
  
  svg {
    width: ${spacing.xxl};
    height: ${spacing.xxl};
    color: ${colors.text.primary};
  }
`;

export const TokenDetailsLogoContainer = styled.div`
  margin: 0 auto ${spacing.xxl};
  margin-top: ${spacing.xxl};
`;

export const TokenDetailsLogo = styled.div`
  width: 140px;
  height: 140px;
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.huge};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.bold};
  position: relative;
  box-shadow: ${shadows.md};
`;

export const TokenDetailsLogoSmall = styled.div`
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 35px;
  height: 35px;
  background: ${colors.background.primary};
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.lg};
  color: ${colors.text.primary};
  font-weight: ${typography.weights.bold};
  border: 3px solid ${colors.border.primary};
  box-shadow: ${shadows.sm};
`;

export const TokenDetailsContent = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding-top: 0;
  margin: 0 auto 0;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxxl};
`;

export const TokenDetailsRow = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 0 0 12px;
`;

export const TokenDetailsLabel = styled.span`
  color: #04133D !important;
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.lg};
  flex: 1;
`;

export const TokenDetailsValue = styled.span`
  color: #1F2D67 !important;
  font-weight: ${typography.weights.bold};
  font-size: ${typography.sizes.lg};
  text-align: right;
  word-break: break-all;
  max-width: 200px;
`;

export const TokenDetailsLink = styled.a`
  color: #1E29F6 !important;
  font-weight: 500;
  font-size: ${typography.sizes.lg};
  text-decoration: none;
  margin-right: ${spacing.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const TokenDetailsCopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.primary};
  padding: 0;
  ${buttonBase}
  
  svg {
    width: ${spacing.xl};
    height: ${spacing.xl};
  }
`;

export const TokenDetailsSendButton = styled.button`
  background: ${colors.primary};
  color: ${colors.background.primary};
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.semibold};
  padding: ${typography.sizes.xxl} 0;
  cursor: pointer;
  margin-top: 0;
  margin-bottom: 0;
  ${buttonBase}
  
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }
`;

export const TokenDetailsActionButtons = styled.div`
  display: flex;
  gap: ${spacing.lg};
  width: 100%;
`;

export const TokenDetailsSecondaryButton = styled.button`
  flex: 1;
  background: none;
  border: 2px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.semibold};
  padding: ${typography.sizes.xxl} 0;
  cursor: pointer;
  ${buttonBase}
  
  &:hover:not(:disabled) {
    background: ${colors.background.hover};
  }
`;

// Snap TokenDetails styles - Consistent spacing and structure
export const snapSpacing = {
  container: spacing.xxl,
  section: spacing.xl,
  item: spacing.lg,
  small: spacing.md
} as const;

export const SnapTokenDetailsContainer = {
  padding: snapSpacing.container,
  background: colors.background.secondary,
  minHeight: '100vh',
  maxWidth: '400px',
  margin: '0 auto'
};

export const SnapHeader = {
  display: 'flex',
  alignItems: 'center',
  padding: snapSpacing.container,
  paddingTop: '48px',
  gap: snapSpacing.small
};

export const SnapBackButton = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  display: 'flex',
  alignItems: 'center'
};

export const SnapHeaderTitle = {
  fontSize: typography.sizes.xxxl,
  fontWeight: typography.weights.medium,
  color: colors.text.primary,
  marginLeft: snapSpacing.small
};

export const SnapSection = {
  padding: `0 ${snapSpacing.container}`,
  marginTop: snapSpacing.section
};

export const SnapSectionTitle = {
  fontSize: typography.sizes.xxxxl,
  fontWeight: typography.weights.semibold,
  color: colors.text.primary,
  marginBottom: snapSpacing.section
};

export const SnapBalanceRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: snapSpacing.item
};

export const SnapTokenInfo = {
  display: 'flex',
  alignItems: 'center',
  gap: snapSpacing.item
};

export const SnapTokenLogo = {
  width: '40px',
  height: '40px',
  backgroundColor: colors.primary,
  borderRadius: borderRadius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const SnapTokenLogoDiamond = {
  width: '24px',
  height: '24px',
  backgroundColor: colors.background.primary,
  borderRadius: borderRadius.sm,
  transform: 'rotate(45deg)'
};

export const SnapTokenDetails = {
  display: 'flex',
  flexDirection: 'column' as const
};

export const SnapTokenName = {
  fontSize: typography.sizes.xl,
  fontWeight: typography.weights.medium,
  color: colors.text.primary
};

export const SnapTokenSymbol = {
  fontSize: typography.sizes.base,
  color: colors.text.secondary
};

export const SnapBalanceValues = {
  textAlign: 'right' as const,
  display: 'flex',
  flexDirection: 'column' as const
};

export const SnapBalanceUSD = {
  fontSize: typography.sizes.xl,
  fontWeight: typography.weights.medium,
  color: colors.text.primary
};

export const SnapBalanceAmount = {
  fontSize: typography.sizes.base,
  color: colors.text.secondary
};

export const SnapDetailsSection = {
  padding: `0 ${snapSpacing.container}`,
  marginTop: '48px'
};

export const SnapDetailRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: snapSpacing.section
};

export const SnapDetailLabel = {
  fontSize: typography.sizes.lg,
  fontWeight: typography.weights.medium,
  color: colors.text.primary
};

export const SnapDetailValue = {
  fontSize: typography.sizes.lg,
  fontWeight: typography.weights.medium,
  color: colors.text.primary
};

export const SnapCopyContainer = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#e8f2ff',
  padding: `${snapSpacing.small} ${snapSpacing.item}`,
  borderRadius: borderRadius.xxl,
  gap: snapSpacing.small
};

export const SnapCopyText = {
  fontSize: typography.sizes.base,
  fontWeight: typography.weights.medium,
  color: colors.primary
};

export const SnapCopyIcon = {
  width: spacing.lg,
  height: spacing.lg,
  color: colors.primary
};

export const SnapButtonSection = {
  padding: `0 ${snapSpacing.container}`,
  marginTop: '48px'
};

export const SnapButton = {
  width: '100%',
  padding: `${snapSpacing.item} 0`,
  borderRadius: borderRadius.xxl,
  fontSize: typography.sizes.lg,
  fontWeight: typography.weights.medium,
  cursor: 'pointer',
  transition: transitions.normal
};

export const SnapOutlineButton = {
  ...SnapButton,
  backgroundColor: 'transparent',
  border: `2px solid ${colors.primary}`,
  color: colors.primary
};

export const BalanceContainer = styled.div`
  padding-top: 0;
  margin: 0 auto 0;
  width: 100%;
  box-sizing: border-box;
`;

export const BalanceTitle = styled.div`
  font-weight: 900;
  font-size: 18px;
  color: #000000 !important;
`;

export const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const BalanceLogoBox = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  margin-right: 16px;
`;

export const BalanceLogoMain = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  color: #222;
  position: absolute;
  top: 0;
  left: 0;
`;

export const BalanceLogoSmall = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
  color: #222;
  position: absolute;
  left: 0;
  bottom: -4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

export const BalanceTokenName = styled.div`
  font-weight: 600;
  font-size: 20px;
  color: #222;
`;

export const BalanceValues = styled.div`
  text-align: right;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const BalanceUsd = styled.div`
  font-weight: 700;
  font-size: 20px;
  color: #111;
  white-space: nowrap;
`;

export const TokenDetailsMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TokenDetailsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

export const TokenDetailsHeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

export const TokenDetailsButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  width: 100%;
`;

export const TokenDetailsDetailsBlock = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

export const TokenDetailsDetailsTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 12px;
`;

export const TokenDetailsDetailsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
`;

export const TokenBalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0 0 12px;
`;

export const TokenBalanceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const TokenBalanceLogoBox = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TokenBalanceLogoBig = styled.div`
  width: 40px;
  height: 40px;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #000000 !important;
  z-index: 1;
`;

export const TokenBalanceLogoSmall = styled.div`
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
  color: #222;
  position: absolute;
  text-align: center;
  right: 2px;
  bottom: 1px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1.5px solid #e5e7eb;
  z-index: 2;
`;

export const TokenBalanceName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: #000000 !important;
  display: flex;
  align-items: center;
  height: 48px;
`;

export const TokenBalanceRight = styled.div`  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #7c8191;
  white-space: nowrap;
  gap: 6px;
  margin-left: 16px;
`;

export const TokenBalanceAmount = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1F2D67 !important;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
`;

export const TokenBalanceSymbol = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1F2D67 !important;
  margin-left: 2px;
`;

export const TokenCircle = styled.div`
  width: 18px;
  height: 18px;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  text-align: center;
`;

export const TokenNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TokenNameText = styled.span`
  font-weight: 600;
  font-size: 18px;
  color: #04133D !important;
`;

export const AddressBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: #f5f7ff;
  border-radius: 24px;
  padding: 4px 18px;
  font-size: 18px;
  font-weight: 500;
  color: #1E29F6;
  gap: 8px;
  user-select: none;
  cursor: pointer;
`;

export const AddressCopyButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #1E29F6;
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
  
  svg path,
  svg rect {
    stroke: #1E29F6 !important;
    fill: none !important;
  }
`;

export const TokensLoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

export const ImportTokenContent = styled.div`
  padding: 0 ${spacing.xxxl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;
