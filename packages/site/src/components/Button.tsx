import React, { memo, useCallback, useTransition } from 'react';
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
        border-radius: 12px;
        padding: 16px 40px;

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
  height: 4.2rem; /* Fixed height to prevent layout shift */
  flex: ${props => props.$fullWidth ? '1' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
  contain: layout style;

  ${props => getVariantStyles(props.$variant)}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const BaseButton: React.FC<ButtonProps & { variant: ButtonVariant }> = memo(({
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
  const [isPending, startTransition] = useTransition();
  const leftIcon = iconLeft || icon;

  const handleClick = useCallback(() => {
    if (onClick && !disabled) {
      startTransition(() => {
        onClick();
      });
    }
  }, [onClick, disabled]);

  return (
    <StyledButton
      $variant={variant}
      $primary={primary}
      $error={error}
      $fullWidth={fullWidth}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
      {isPending ? 'Loading...' : text}
      {iconRight && <IconWrapper $position="right">{iconRight}</IconWrapper>}
    </StyledButton>
  );
});

BaseButton.displayName = 'BaseButton';

export const Button: React.FC<ButtonProps> = memo((props) => (
  <BaseButton {...props} variant="default" />
));

Button.displayName = 'Button';

export const ButtonAction: React.FC<ButtonProps> = memo((props) => (
  <BaseButton {...props} variant="action" />
));

ButtonAction.displayName = 'ButtonAction';

export const ButtonCancel: React.FC<ButtonProps> = memo((props) => (
  <BaseButton {...props} variant="cancel" />
));

ButtonCancel.displayName = 'ButtonCancel';

const WhiteBlueButton = styled(StyledButton)`
  background-color: #FFFFFF;
  color: #1E29F6;
  border: 2px solid #1E29F6;
  
  &:hover:not(:disabled) {
    background-color: #1E29F6;
    border: 2px solid #1E29F6;
    color: #f8f9fa !important;
  }
  
  &:active {
    background-color: #e9ecef;
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    border-color: #dee2e6;
  }
`;

const RedButton = styled(StyledButton)`
  background-color: #ff1900;
  color: #FFFFFF;
  transition: none;
  
  &:hover:not(:disabled) {
    background-color: #c82333;
    border-color: #bd2130;
  }
  
  &:active {
    background-color: #bd2130;
    border-color: #b21e2f;
  }
  
  &:disabled {
    background-color: #f8d7da;
    color: #721c24;
    border-color: #f5c6cb;
  }
`;

export const ButtonCancelWhite: React.FC<ButtonProps> = memo(({
  text,
  primary = false,
  error = false,
  fullWidth = false,
  onClick,
  disabled = false,
  icon,
  iconLeft,
  iconRight,
}) => {
  const [isPending, startTransition] = useTransition();
  const leftIcon = iconLeft || icon;

  const handleClick = useCallback(() => {
    if (onClick && !disabled) {
      startTransition(() => {
        onClick();
      });
    }
  }, [onClick, disabled]);

  return (
    <WhiteBlueButton
      $variant="default"
      $primary={primary}
      $error={error}
      $fullWidth={fullWidth}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
      {isPending ? 'Loading...' : text}
      {iconRight && <IconWrapper $position="right">{iconRight}</IconWrapper>}
    </WhiteBlueButton>
  );
});

ButtonCancelWhite.displayName = 'ButtonCancelWhite';

export const ButtonDeleteRed: React.FC<ButtonProps> = memo(({
  text,
  primary = false,
  error = false,
  fullWidth = false,
  onClick,
  disabled = false,
  icon,
  iconLeft,
  iconRight,
}) => {
  const [isPending, startTransition] = useTransition();
  const leftIcon = iconLeft || icon;

  const handleClick = useCallback(() => {
    if (onClick && !disabled) {
      startTransition(() => {
        onClick();
      });
    }
  }, [onClick, disabled]);

  return (
    <RedButton
      $variant="default"
      $primary={primary}
      $error={error}
      $fullWidth={fullWidth}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
      {isPending ? 'Loading...' : text}
      {iconRight && <IconWrapper $position="right">{iconRight}</IconWrapper>}
    </RedButton>
  );
});

ButtonDeleteRed.displayName = 'ButtonDeleteRed';