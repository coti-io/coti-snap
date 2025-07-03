import React from 'react';
import styled, { css } from 'styled-components';
import ErrorIcon from '../../assets/badges/error.svg';
import SuccessIcon from '../../assets/badges/success.svg';
import LoadingIcon from '../../assets/badges/loading.svg';

export type AlertType = 'error' | 'success' | 'loading';

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
  className?: string;
}

interface AlertContainerProps {
  $type: AlertType;
}

const ALERT_STYLES = {
  error: css`
    background: #ffecec;
    color: #000000;
    border-left: 5px solid #e53935;
  `,
  success: css`
    background: #f4fff7;
    color: #000000;
    border-left: 5px solid #43a047;
  `,
  loading: css`
    background: #fff7d0;
    color: #000000;
    border-left: 5px solid #a9a224;
  `,
} as const;

const ALERT_ICONS = {
  error: ErrorIcon,
  success: SuccessIcon,
  loading: LoadingIcon,
} as const;

const AlertContainer = styled.div<AlertContainerProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-radius: 5px;
  font-size: 1.6rem;
  width: auto;
  transition: all 0.2s ease-in-out;
  
  ${({ $type }) => ALERT_STYLES[$type]}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
  line-height: 1.4;
`;

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  children, 
  className 
}) => {
  const IconComponent = ALERT_ICONS[type];
  const alertRole = type === 'error' ? 'alert' : 'status';
  const alertAriaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <AlertContainer 
      $type={type} 
      className={className}
      role={alertRole}
      aria-live={alertAriaLive}
    >
      <IconWrapper aria-hidden="true">
        <IconComponent />
      </IconWrapper>
      <AlertContent>
        {children}
      </AlertContent>
    </AlertContainer>
  );
}; 