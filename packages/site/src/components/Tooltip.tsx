import React from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 5px;
`;

const TooltipText = styled.div`
  visibility: hidden;
  min-width: 220px;
  max-width: 320px;
  background: #fff;
  color: #6b7280;
  text-align: left;
  border-radius: 10px;
  padding: 10px 14px;
  position: absolute;
  z-index: 10;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  box-shadow: 0 4px 24px rgba(24,25,29,0.10);
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.4;
  transition: opacity 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 8px 10px 8px;
    border-style: solid;
    border-color: transparent transparent #fff transparent;
    filter: drop-shadow(0 -2px 4px rgba(24,25,29,0.10));
  }

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <TooltipContainer>
      {children}
      <TooltipText>{text}</TooltipText>
    </TooltipContainer>
  );
}; 