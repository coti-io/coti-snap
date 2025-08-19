import React, { useState } from 'react';

import CheckIcon from '../../assets/check.svg';
import CopyIcon from '../../assets/copy.svg';
import { useSnap } from '../../hooks/SnapContext';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Button } from '../Button';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import {
  AESInput,
  AESKeyContainer,
  ContentInput,
  IconContainer,
} from './styles';
import { DeleteAESKey } from './DeleteAESKey';

interface ManageAESKeyProps {
  readonly handleShowDelete: () => void;
}

export const ManageAESKey: React.FC<ManageAESKeyProps> = ({
  handleShowDelete,
}) => {
  const { userAESKey, getAESKey, loading } = useSnap();
  const [showDeleteState, setShowDeleteState] = useState(false);

  const { copied: isCopied, copyToClipboard } = useCopyToClipboard({ 
    successDuration: 2000
  });

  const handleCopyClick = (): void => {
    if (userAESKey) {
      copyToClipboard(userAESKey);
    }
  };

  const handleRevealClick = async (): Promise<void> => {
    try {
      await getAESKey();
    } catch (error) {
      console.error('Error revealing AES key:', error);
    }
  };

  const handleDeleteClick = (): void => {
    setShowDeleteState(true);
  };

  const handleCancelDelete = (): void => {
    setShowDeleteState(false);
  };

  if (loading) {
    return (
      <Loading
        title="Key Management"
        actionText="Approve in your wallet to reveal your AES key"
      />
    );
  }

  if (showDeleteState) {
    return <DeleteAESKey handleShowDelete={handleCancelDelete} />;
  }

  return (
    <>
      <ContentTitle>Key Management</ContentTitle>
      <ContentInput>
        <ContentText id="aes-key-label">AES Key</ContentText>
        <AESKeyContainer role="group" aria-labelledby="aes-key-label">
          {userAESKey ? (
            <>
              <AESInput 
                type="text" 
                value={userAESKey ?? ''} 
                readOnly={true}
                aria-label="Your AES Key"
                aria-describedby="aes-key-label"
              />
              <IconContainer 
                onClick={handleCopyClick}
                aria-label={isCopied ? "AES Key copied to clipboard" : "Copy AES Key to clipboard"}
                title={isCopied ? "Copied!" : "Copy to clipboard"}
                aria-live="polite"
              >
                {isCopied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
              </IconContainer>
            </>
          ) : (
            <ContentText id="aes-key-description" role="status">
              Hidden AES key - click Reveal to show
            </ContentText>
          )}
        </AESKeyContainer>
      </ContentInput>
      <Button
        disabled={userAESKey !== null}
        text="Reveal AES Key"
        primary={true}
        onClick={handleRevealClick}
        aria-label="Reveal your AES key"
        aria-describedby="aes-key-description"
      />
      <Button 
        text="Delete" 
        primary={false} 
        onClick={handleDeleteClick}
        aria-label="Delete AES key"
      />
    </>
  );
};
