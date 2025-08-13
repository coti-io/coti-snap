import React from 'react';
import styled, { css } from 'styled-components';

// Types
export type ButtonVariant = 'default' | 'action' | 'cancel';

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  primary?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  onClick?: (() => void) | (() => Promise<void>);
  disabled?: boolean;
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

interface StyledButtonProps {
  $variant: ButtonVariant;
  $primary?: boolean;
  $error?: boolean;
  $fullWidth?: boolean;
  $disabled?: boolean;
}

// Constants
const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  action: '#1E29F6',
  actionHover: 'rgba(30, 41, 246, 0.8)',
  cancel: '#ff1900',
  cancelHover: 'rgba(255, 25, 0, 0.8)',
  error: 'rgba(248, 110, 110, 0.2)',
  errorHover: 'rgba(248, 110, 110, 0.3)',
} as const;

// Styled Components
const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  margin-${props => props.$position === 'left' ? 'right' : 'left'}: 8px;
`;

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'action':
      return css`
        background-color: ${COLORS.action};
        border: none;
        border-radius: ${props => props.theme.radii.small};
        padding: 15px 40px;

        &:hover:not(:disabled) {
          background-color: ${COLORS.actionHover};
        }

        &:disabled {
          background-color: ${COLORS.actionHover};
          color: ${COLORS.white};
        }
      `;

    case 'cancel':
      return css`
        background-color: ${COLORS.cancel};
        border: none;
        border-radius: ${props => props.theme.radii.small};
        padding: 15px 40px;

        &:hover:not(:disabled) {
          background-color: ${COLORS.cancelHover};
        }

        &:disabled {
          background-color: ${COLORS.cancelHover};
          color: ${COLORS.white};
        }
      `;

    default:
      return css<StyledButtonProps>`
        background-color: ${props => {
          if (props.$error) return COLORS.error;
          if (props.$primary) return 'rgba(255, 255, 255, 0.2)';
          return 'rgba(255, 255, 255, 0.15)';
        }};
        border: ${props =>
          props.$error || props.$primary
            ? 'none'
            : '1px solid rgba(255, 255, 255, 0.3)'
        };
        border-radius: ${props => props.theme.radii.button};
        padding: 12px 40px;

        &:hover:not(:disabled) {
          background-color: ${props => {
          if (props.$error) return COLORS.errorHover;
          if (props.$primary) return 'rgba(255, 255, 255, 0.3)';
          return 'rgba(255, 255, 255, 0.25)';
        }};
          border: ${props =>
          props.$error || props.$primary
            ? 'none'
            : '1px solid rgba(255, 255, 255, 0.5)'
        };
        }

        &:disabled {
          background-color: rgba(255, 255, 255, 0.1);
          color: ${COLORS.black};
        }
      `;
  }
};

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sofia Pro', sans-serif;
  font-size: ${props => props.theme.fontSizes.small};
  font-weight: 500;
  line-height: 1.2;
  color: ${COLORS.white};
  min-height: 4.2rem;
  flex: ${props => props.$fullWidth ? '1' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${props => getVariantStyles(props.$variant)}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const BaseButton: React.FC<ButtonProps & { variant: ButtonVariant }> = ({
  text,
  variant,
  primary = false,
  error = false,
  fullWidth = false,
  onClick,
  disabled = false,
  icon,
  iconLeft,
  iconRight,
}) => {
  const leftIcon = iconLeft || icon;

  return (
    <StyledButton
      $variant={variant}
      $primary={primary}
      $error={error}
      $fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
    >
      {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
      {text}
      {iconRight && <IconWrapper $position="right">{iconRight}</IconWrapper>}
    </StyledButton>
  );
};

export const Button: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="default" />
);

export const ButtonAction: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="action" />
);

export const ButtonCancel: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="cancel" />
);