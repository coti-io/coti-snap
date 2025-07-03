import React from 'react';
import styled from 'styled-components';

const IconButton = styled.span<{ disabled?: boolean }>`
  margin-left: 12px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  color: ${({ disabled }) => disabled ? '#9ca3af' : '#007bff'};
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  transition: opacity 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  
  &:hover {
    color: ${({ disabled }) => disabled ? '#9ca3af' : '#0056b3'};
  }
`;

interface ToggleIconProps {
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ToggleIcon: React.FC<ToggleIconProps> = ({
  onClick,
  title,
  disabled = false,
  className,
  children
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <IconButton
      onClick={handleClick}
      title={title}
      disabled={disabled}
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </IconButton>
  );
};