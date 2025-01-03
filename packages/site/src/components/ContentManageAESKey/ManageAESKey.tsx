import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as CopyIcon } from '../../assets/copy.svg';
import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';

const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: medium;
  margin: 0;
`;

const ContentInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
`;

const AESKeyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  min-height: 46px;
`;

const EditableInput = styled.input`
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

const IconContainer = styled.button<{ $isCopied?: boolean }>`
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

export const ManageAESKey = ({
  handleShowDelete,
}: {
  handleShowDelete: () => void;
}) => {
  const { userAESKey, setUserAesKEY, getAESKey } = useSnap();

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        setUserAesKEY(null);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (error) => {
        console.error(
          'Failed to copy text: ',
          error === undefined ? '' : error,
        );
        setIsCopied(false);
      },
    );
  }, []);

  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentInput>
        <ContentText>AES Key</ContentText>
        <AESKeyContainer>
          {userAESKey ? (
            <>
              <EditableInput
                type="text"
                value={userAESKey ?? ''}
                readOnly={true}
              />
              <IconContainer onClick={() => copyToClipboard(userAESKey ?? '')}>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </IconContainer>
            </>
          ) : (
            <ContentText>**************************************</ContentText>
          )}
        </AESKeyContainer>
      </ContentInput>
      <Button text="Reveal AES Key" primary={true} onClick={getAESKey} />
      <Button text="Delete" primary={false} onClick={handleShowDelete} />
    </>
  );
};
