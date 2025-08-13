import styled from 'styled-components';
import ArrowDown from '../../../assets/arrow-down.svg';
import { colors, spacing, typography, borderRadius, transitions, slideUpFadeIn } from './theme';

export const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: ${typography.weights.bold};
  margin-top: ${spacing.xxl};
  margin-bottom: ${spacing.sm};
  color: #04133D99 !important;
  
  @media (max-width: 600px) {
    font-size: 11px;
    margin-top: ${spacing.lg};
    margin-bottom: ${spacing.xs};
  }
`;

export const AccountBox = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'error'
})<{ active?: boolean; error?: boolean }>`
  display: flex;
  align-items: center;
  background: #F4F5FC !important;
  border-radius: ${borderRadius.lg};
  padding: 8px 18px;
  gap: 14px;
  margin-bottom: ${spacing.sm};
  cursor: pointer;
  transition: background ${transitions.normal};
  
  &:hover {
    background: ${colors.background.hover};
  }
  
  @media (max-width: 600px) {
    padding: 6px 14px;
    gap: 10px;
    margin-bottom: ${spacing.xs};
  }
`;

export const AccountIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.full};
  background: linear-gradient(135deg, #ffe14d 60%, ${colors.primary} 40%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  
  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
    font-size: 1.8rem;
  }
`;

export const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AccountAddress = styled.div`
  font-size: ${typography.sizes.md};
  color: #000000 !important;
  font-weight: ${typography.weights.normal};
  margin-top: ${spacing.sm};
  
  @media (max-width: 600px) {
    font-size: ${typography.sizes.sm};
    margin-top: ${spacing.xs};
  }
`;

export const InputBox = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.background.primary};
  border-radius: ${borderRadius.lg};
  border: 1px solid ${colors.border.secondary};
  padding: 18px ${spacing.lg};
  gap: ${spacing.sm};
  max-width: 420px;
  margin-bottom: ${spacing.sm};
  transition: border ${transitions.normal};
  
  &:focus-within {
    border: 1.5px solid ${colors.primary};
  }
  
  @media (max-width: 600px) {
    padding: 14px ${spacing.md};
    gap: ${spacing.xs};
  }
`;

export const AddressInput = styled.input`
  border: none;
  outline: none;
  font-size: ${typography.sizes.md};
  flex: 1;
  background: transparent;
  color: #000000 !important;
  
  @media (max-width: 600px) {
    font-size: ${typography.sizes.sm};
  }
`;

export const AmountInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.normal};
  color: #1F2D67 !important;
  width: auto;
  max-width: 120px;
  text-align: right;
  padding: 0 4px;
  appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
  
  @media (max-width: 600px) {
    max-width: 80px;
    font-size: 14px;
  }
`;

export const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.lg};
  
  @media (max-width: 600px) {
    flex-direction: column-reverse;
    gap: 0px;
  }
`;

export const CancelButton = styled.button`
  flex: 1;
  background: none;
  border: 2px solid ${colors.primary};
  color: ${colors.primary};
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  border-radius: ${borderRadius.xxxl};
  padding: 18px 0;
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
  border-radius: ${borderRadius.xxxl};
  padding: 18px 0;
  cursor: pointer;
  transition: background ${transitions.normal}, opacity ${transitions.normal};
  
  &:hover {
    background: ${colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${colors.primary};
  }
`;

export const HeaderBarSlotLeft = styled.div`
  width: auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  margin: 0;
  position: relative;
`;

export const HeaderBarSlotTitle = styled.div`
  flex: 1;
  text-align: center;
  font-weight: ${typography.weights.bold};
  font-size: ${typography.sizes.xxxxl};
  
  @media (max-width: 600px) {
    font-size: ${typography.sizes.xxl};
  }
`;

export const HeaderBarSlotRight = styled.div`
  width: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const BalanceSubTransfer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'error'
})<{ error?: boolean }>`
  font-size: ${typography.sizes.base};
  color: ${({ error }) => (error ? `${colors.error} !important` : "#04133D99 !important")};
  font-weight: ${typography.weights.normal};
  flex: 1;
  margin-bottom: ${spacing.md};
  
  @media (max-width: 600px) {
    font-size: ${typography.sizes.sm};
    margin-bottom: ${spacing.xs};
  }
`;

export const MaxButton = styled.button`
  background: none;
  border: none;
  color: #04133D99 !important;
  font-size: ${typography.sizes.base};
  font-weight: ${typography.weights.bold};
  cursor: pointer;
  transition: opacity ${transitions.normal};
  
  &:hover {
    opacity: 0.8;
  }
  
  @media (max-width: 600px) {
    font-size: ${typography.sizes.sm};
  }
`;

export const TokenRowFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const ArrowDownStyled = styled(ArrowDown)`
  margin-left: ${spacing.sm};
  width: 22px;
  height: 22px;
  color: #1F2D67 !important;
  
  @media (max-width: 600px) {
    width: 18px;
    height: 18px;
    margin-left: ${spacing.xs};
  }
`;

export const ClearIconButton = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  width: 20px;
  height: 20px;
  justify-content: center;
  border-radius: 35%;
  transition: background ${transitions.fast};
  
  &:hover {
    background: ${colors.background.tertiary};
  }
  
  @media (max-width: 600px) {
    width: 18px;
    height: 18px;
  }
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${colors.text.primary};
  cursor: pointer;
  border-radius: 35%;
  height: 32px;
  width: 32px;
  margin-left: auto;
  transition: background ${transitions.fast};
  padding: 0;
  
  &:hover {
    background: ${colors.background.tertiary};
    border-radius: 35%;
  }
  
  svg {
    width: 22px;
    height: 22px;
    display: block;
  }
`;

export const TokenModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(24, 25, 29, 0.29);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TokenModalContainer = styled.div`
  background: ${colors.background.primary};
  border-radius: ${borderRadius.xxl};
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.12);
  width: 420px;
  max-width: 98vw;
  max-height: 60vh;
  padding: 0 0 ${spacing.xxl} 0;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: ${slideUpFadeIn} ${transitions.slow} both;
  overflow: hidden;
`;

export const TokenModalHeader = styled.div`
  font-size: ${typography.sizes.xxxxl};
  font-weight: ${typography.weights.bold};
  text-align: center;
  padding: ${spacing.xxxl} ${spacing.xxxl} 0 ${spacing.xxxl};
  color: #000000 !important;
`;

export const TokenModalClose = styled.button`
  position: absolute;
  top: ${spacing.xxxl};
  right: ${spacing.xxxl};
  background: none;
  border: none;
  font-size: 2.2rem;
  color: ${colors.text.primary};
  cursor: pointer;
  
  &:hover {
    background: ${colors.background.tertiary};
    border-radius: ${borderRadius.sm};
  }
`;

export const TokenTabs = styled.div`
  display: flex;
  width: 100%;
  margin-top: ${spacing.xxl};
  border-bottom: 0.5px solid rgb(205, 205, 205);
`;

export const TokenTab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.semibold};
  color: ${({ active }) => (active ? '#222' : colors.text.muted)};
  border-bottom: 2px solid ${({ active }) => (active ? '#1E29F6' : colors.border.primary)};
  padding: ${spacing.md} 0 10px 0;
  cursor: pointer;
  transition: color ${transitions.normal}, border-bottom ${transitions.normal};
`;

export const TokenSearchBox = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.background.primary};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.border.primary};
  padding: 0 18px;
  margin: 14px ${spacing.xxxl} 18px ${spacing.xxxl};
  transition: border ${transitions.normal};
  
  &:hover,
  &.active {
    border: 2px solid ${colors.primary};
  }
`;

export const TokenSearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${colors.text.primary};
  font-size: ${typography.sizes.md};
  margin-left: ${spacing.md};
  padding: ${spacing.md} 0;
  
  &::placeholder {
    color: ${colors.text.muted};
    opacity: 1;
  }
`;

export const TokenList = styled.div`
  margin: 0 0px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const TokenListItemBar = styled.div`
  position: absolute;
  left: 4px;
  top: 4px;
  bottom: 4px;
  width: 5px;
  border-radius: ${borderRadius.md};
  background: ${colors.secondary};
`;

export const TokenListItem = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${({ selected }) => (selected ? '#e3e6fe' : 'none')};
  border: none;
  padding: 14px 14px 14px 22px;
  position: relative;
  margin-bottom: ${spacing.sm};
  cursor: pointer;
  transition: background ${transitions.fast};
`;

export const TokenListInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 18px;
`;

export const TokenListName = styled.div`
  font-size: ${typography.sizes.xl};
  font-weight: ${typography.weights.bold};
  color: #000000 !important;
`;

export const TokenListSymbol = styled.div`
  font-size: ${typography.sizes.sm};
  color: #000000 !important;
  font-weight: ${typography.weights.normal};
  align-self: flex-start;
  margin-top: 4px;
`;

export const TokenListAmount = styled.div`
  margin-left: auto;
  text-align: right;
  color: #000000 !important;
`;

export const TokenListValue = styled.div`
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.bold};
  color: #000000 !important;
`;

export const NoNFTsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  width: 100%;
`;

export const NoNFTsText = styled.div`
  color: #000000 !important;
  font-size: ${typography.sizes.xxl};
  font-weight: ${typography.weights.medium};
  margin-bottom: 18px;
`;

export const LearnMoreLink = styled.a`
  color:rgb(8, 4, 239) !important;
  font-size: ${typography.sizes.xxl};
  font-weight: ${typography.weights.semibold};
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;