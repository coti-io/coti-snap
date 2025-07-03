import React from 'react';
import styled, { css } from 'styled-components';
import { colors, typography, transitions, spacing } from '../styles/theme';

interface TokenIdProps {
  readonly tokenId?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly variant?: 'inline' | 'badge' | 'custom';
  readonly showHash?: boolean;
}

interface TokenIdContainerProps {
  $variant: 'inline' | 'badge' | 'custom';
}

const variantStyles = {
  inline: css`
    margin-left: ${spacing.sm};
    color: ${colors.text.muted};
    font-size: ${typography.sizes.md};
    font-weight: ${typography.weights.normal};
    opacity: 0.8;
    padding: 0;
    
    &:hover {
      opacity: 1;
    }
  `,
  badge: css`
    padding: ${spacing.md} ${spacing.lg};
    color: ${colors.text.muted};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.medium};
    margin-left: 0;
    display: inline-block;
  `,
  custom: css`
    /* Base styles for custom usage - can be overridden with className */
    color: ${colors.text.muted};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.normal};
  `
};

const TokenIdContainer = styled.span<TokenIdContainerProps>`
  transition: opacity ${transitions.normal};
  
  ${({ $variant }) => variantStyles[$variant]}
`;

export const TokenId: React.FC<TokenIdProps> = ({ 
  tokenId,
  children,
  className,
  variant = 'inline',
  showHash = true
}) => {
  const content = children || (tokenId ? `${showHash ? '#' : ''}${tokenId}` : '');
  
  return (
    <TokenIdContainer 
      $variant={variant}
      className={className}
      aria-label={tokenId ? `Token ID ${tokenId}` : undefined}
      title={tokenId ? `Token ID: ${tokenId}` : undefined}
    >
      {content}
    </TokenIdContainer>
  );
};