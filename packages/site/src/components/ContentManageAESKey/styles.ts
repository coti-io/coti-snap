import type { setAESKeyErrorsType } from 'src/hooks/SnapContext';
import styled, { css } from 'styled-components';

interface EditableInputContainerProps {
  $isEditable: boolean;
  $isError: setAESKeyErrorsType;
}

interface EditableInputProps {
  $isEditable: boolean;
}

interface IconContainerProps {
  $isCopied?: boolean;
}

const commonInputStyles = css`
  border: none;
  outline: none;
  font-size: 14px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  width: 100%;
`;

const commonButtonStyles = css`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  width: 24px;
  height: 24px;
  
  &:hover {
    border: none;
  }
`;

const commonIconStyles = css`
  width: 24px;
  height: 24px;
  transition: fill 0.2s ease-in-out;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: left;
  padding: 80px;
  gap: 16px;
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
  width: auto;
  overflow-y: auto;
  max-height: 470px;
  
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    gap: 16px;
    padding: 40px 24px;
  }
`;

export const ContentInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
`;

export const ContentButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column-reverse;
  }
`;

export const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

export const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: medium;
  margin: 0;
`;

export const ContentBoldText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: bold;
  margin: 0;
`;


export const Link = styled.a`
  color: white;
  background-color: #1E29F6;
  text-decoration: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
  
  &:hover {
    background-color: #4d55f7;
    text-decoration: none;
  }
`;

export const AESKeyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  min-height: 46px;
`;

export const AESInput = styled.input`
  ${commonInputStyles}
  cursor: none;
  
  &:read-only {
    pointer-events: none;
  }
`;

export const EditableInputContainer = styled.div<EditableInputContainerProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  border: ${(props) => {
    if (props.$isError !== null) {
      return `1px solid ${props.theme.colors.error?.default}`;
    } else if (props.$isEditable) {
      return `1px solid ${props.theme.colors.success?.default}`;
    }
    return 'none';
  }};
  border-radius: 4px;
  transition: border-color 0.2s ease-in-out;
`;

export const EditableInput = styled.input<EditableInputProps>`
  ${commonInputStyles}
  cursor: ${(props) => (props.$isEditable ? 'text' : 'default')};
  
  &:read-only {
    pointer-events: none;
  }
`;

export const IconContainer = styled.button<IconContainerProps>`
  ${commonButtonStyles}

  svg {
    ${commonIconStyles}
    fill: ${(props) =>
      props.$isCopied ? props.theme.colors.primary?.default : props.theme.colors.text?.muted || '#8c8c8c'};

    &:hover {
      fill: ${(props) => props.theme.colors.primary?.default};
    }
  }
`;

export const Edit = styled.button`
  ${commonButtonStyles}

  svg {
    ${commonIconStyles}
    fill: ${(props) => props.theme.colors.text?.muted || '#8c8c8c'};

    &:hover {
      fill: ${(props) => props.theme.colors.primary?.default};
    }
  }
`;

