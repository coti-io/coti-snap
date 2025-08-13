import styled from 'styled-components';
import { colors, spacing } from './theme';

export const PrimaryBalanceAmount = styled.div`
  font-weight: 600;
  font-size: 28px;
  color: #000000 !important;
  margin-top: 2px;
  white-space: nowrap;
  text-align: center;
`;

export const SecondaryBalanceAmount = styled.div`
  font-weight: 450;
  font-size: 18px;
  color: #000000 !important;
  white-space: nowrap;
  text-align: center;
  align-items: center;
  justify-content: center;
  display: flex;
`;


export const TokenBalanceAmount = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #000000 !important;
  margin-top: 2px;
  white-space: nowrap;
  text-align: center;
`;

export const BalanceEye = styled.button`
  background: none;
  padding: 0;
  margin-left: ${spacing.xs};
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
  
  svg {
    width: 22px;
    height: 22px;
    color: #000000 !important;
    stroke: ${colors.text.muted};
    fill: ${colors.background.primary};
  }
`;