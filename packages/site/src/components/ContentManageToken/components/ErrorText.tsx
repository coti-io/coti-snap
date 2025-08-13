import React from 'react';
import styled from 'styled-components';

interface ErrorTextProps {
  readonly children?: React.ReactNode;
  readonly message?: string;
  readonly className?: string;
}

const ErrorTextContainer = styled.span`
  color: #A5135C !important; 
  font-size: 14px;
  font-weight: 500;
`;

export const ErrorText: React.FC<ErrorTextProps> = ({ 
  children,
  message,
  className
}) => {
  const content = message || children;
  
  if (!content) {
    return null;
  }
  
  return (
    <ErrorTextContainer className={className}>
      {content}
    </ErrorTextContainer>
  );
};