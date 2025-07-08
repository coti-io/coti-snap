import React from 'react';
import styled from 'styled-components';

type ButtonProps = {
  text: string;
  primary?: boolean;
  error?: boolean;
  fullWith?: boolean;
  onClick?: (() => void) | (() => Promise<void>);
  disabled?: boolean;
  icon?: React.ReactNode;
};

const getBackgroundColor = (props: any) => {
  if (props.$error) {
    return props.theme.colors.error?.default10;
  }
  if (props.$primary) {
    return props.theme.colors.primary?.default;
  }
  if (props.$disabled) {
    return props.theme.colors.background?.default10;
  }
  return props.theme.colors.background?.content;
};

const getColor = (props: any) => {
  if (props.$error) {
    return props.theme.colors.error?.default;
  }
  if (props.$primary) {
    return props.theme.colors.primary?.inverse;
  }
  return props.theme.colors.primary?.default;
};

const getBorder = (props: any) => {
  if (props.$error || props.$primary) {
    return 'none';
  }
  return `1px solid ${props.theme.colors.primary?.default}`;
};

const getHoverBackgroundColor = (props: any) => {
  if (props.$error) {
    return props.theme.colors.error?.hover;
  }
  if (props.$primary) {
    return props.theme.colors.primary?.hover;
  }
  return props.theme.colors.secondary?.default10;
};

const getHoverBorder = (props: any) => {
  if (props.$error || props.$primary || props.$disabled) {
    return 'none';
  }
  return `1px solid ${props.theme.colors.primary?.default}`;
};

const getHoverColor = (props: any) => {
  if (props.$error) {
    return props.theme.colors.error?.default;
  }
  if (props.$primary) {
    return props.theme.colors.primary?.inverse;
  }
  return props.theme.colors.primary?.default;
};

const ButtonStyle = styled.button<{
  $primary?: boolean;
  $error?: boolean;
  $fullWith?: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  border-radius: ${(props) => props.theme.radii.button};
  background-color: ${getBackgroundColor};
  color: ${getColor};
  border: ${getBorder};
  font-weight: 500;
  font-size: 'Sofia Pro';
  flex: ${(props) => (props.$fullWith ? '1' : 'none')};
  padding: 12px 40px;
  min-height: 4.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${getHoverBackgroundColor};
    border: ${getHoverBorder};
    color: ${getHoverColor};
  }

  &:disabled {
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.inverse};
    opacity: 0.5;
  }
`;

export const Button: React.FC<ButtonProps & { icon?: React.ReactNode }> = ({
  text,
  primary = false,
  error = false,
  fullWith = false,
  onClick,
  disabled = false,
  icon,
}) => {
  return (
    <ButtonStyle
      $primary={primary}
      $error={error}
      $fullWith={fullWith}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
      {text}
    </ButtonStyle>
  );
};
