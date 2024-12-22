import React, { useCallback, useState } from 'react';

import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as CopyIcon } from '../../assets/copy.svg';
import { Button } from '../Button';
import {
  AESKeyContainer,
  ContentInput,
  ContentText,
  ContentTitle,
  EditableInput,
  IconContainer,
} from './style';

export const ManageAESKey = ({
  handleShowDelete,
}: {
  handleShowDelete: () => void;
}) => {
  const [value] = useState<string>(
    '0x3A5470Fa1cF02B6f96CB1E678d93B6D63b571444',
  );
  const [reveal, setReveal] = useState<boolean>(false);

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        setReveal(false);
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
          {reveal ? (
            <>
              <EditableInput
                $isEditable={false}
                type="text"
                value={value}
                readOnly={true}
              />
              <IconContainer onClick={() => copyToClipboard(value)}>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </IconContainer>
            </>
          ) : (
            <ContentText>**************************************</ContentText>
          )}
        </AESKeyContainer>
      </ContentInput>
      <Button
        text="Reveal AES Key"
        primary={true}
        onClick={() => setReveal(!reveal)}
      />
      <Button text="Delete" primary={false} onClick={handleShowDelete} />
    </>
  );
};
