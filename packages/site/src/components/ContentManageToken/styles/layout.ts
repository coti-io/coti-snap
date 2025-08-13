import styled from 'styled-components';
import { 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  transitions, 
  buttonBase 
} from './theme';

export const MainStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxxl};
`;

export const QuickAccessGroup = styled.nav`
  display: flex;
  gap: ${spacing.xxxxl};
  justify-content: center;
  align-items: flex-start;
`;

export const QuickAccessItem = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
`;

export const QuickAccessButton = styled.button`
  width: 44px;
  height: 44px;
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
  color: ${colors.text.primary};
  font-size: ${typography.sizes.md};
  font-weight: ${typography.weights.normal};
  text-align: center;
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
  font-weight: ${({ active }) => (active ? typography.weights.bold : typography.weights.medium)};
  color: ${({ active }) => (active ? colors.text.primary : colors.text.tertiary)};
  border-bottom: 3px solid ${({ active }) => (active ? colors.text.primary : colors.border.primary)};
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

export const DepositHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: ${spacing.lg};
`;

export const DepositHeaderSpacer = styled.div`
  width: 48px;
`;