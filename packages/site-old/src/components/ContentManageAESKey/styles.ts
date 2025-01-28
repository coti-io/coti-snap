import styled from 'styled-components';

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
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    gap: 16px;
    padding: 40px 24px;
  }
`;

export const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

export const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: medium;
  margin: 0;
`;

export const ContentInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
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
  border: none;
  outline: none;
  font-size: 14px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  width: 100%;
  cursor: none;
  &:read-only {
    pointer-events: none;
  }
`;

export const IconContainer = styled.button<{ $isCopied?: boolean }>`
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

  svg {
    width: 24px;
    height: 24px;
    fill: ${(props) =>
      props.$isCopied ? props.theme.colors.primary?.default : '#8c8c8c'};
    transition: fill 0.2s ease-in-out;

    &:hover {
      fill: ${(props) => props.theme.colors.primary?.default};
    }
  }
`;

export const ContentBoldText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: bold;
  margin: 0;
`;

export const ContentButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const ContentErrorText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: medium;
  margin: 0;
  color: ${(props) => props.theme.colors.error?.default};
`;

export const Link = styled.a`
  color: ${(props) => props.theme.colors.primary?.default};
  text-decoration: none;
  cursor: pointer;
`;

export const EditableInputContainer = styled.div<{
  $isEditable: boolean;
  $isError: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  border: ${(props) => {
    if (props.$isError) {
      return '1px solid #F86E6E';
    } else if (props.$isEditable) {
      return '1px solid #0EB592';
    }
    return 'none';
  }};
`;

export const EditableInput = styled.input<{ $isEditable: boolean }>`
  border: none;
  outline: none;
  font-size: 14px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  width: 100%;
  cursor: ${(props) => (props.$isEditable ? 'text' : 'default')};
  &:read-only {
    pointer-events: none;
  }
`;

export const Edit = styled.button`
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

  svg {
    width: 24px;
    height: 24px;
    fill: #8c8c8c;
    transition: fill 0.2s ease-in-out;

    &:hover {
      fill: ${(props) => props.theme.colors.primary?.default};
    }
  }
`;
