import { useCallback, useState } from 'react';

import CheckIcon from '../../assets/check.svg';
import CopyIcon from '../../assets/copy.svg';
import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import {
  AESInput,
  AESKeyContainer,
  ContentInput,
  IconContainer,
} from './styles';

export const ManageAESKey = ({
  handleShowDelete,
}: {
  handleShowDelete: () => void;
}) => {
  const { userAESKey, setUserAesKEY, getAESKey, loading } = useSnap();

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

  if (loading) {
    <Loading
      title="Manage your AES Key"
      actionText="Approve in your wallet to reveal your AES key"
    />;
  }

  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentInput>
        <ContentText>AES Key</ContentText>
        <AESKeyContainer>
          {userAESKey ? (
            <>
              <AESInput type="text" value={userAESKey ?? ''} readOnly={true} />
              <IconContainer onClick={() => copyToClipboard(userAESKey ?? '')}>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </IconContainer>
            </>
          ) : (
            <ContentText>**************************************</ContentText>
          )}
        </AESKeyContainer>
      </ContentInput>
      <Button
        disabled={userAESKey !== null}
        text="Reveal AES Key"
        primary={true}
        onClick={getAESKey}
      />
      <Button text="Delete" primary={false} onClick={handleShowDelete} />
    </>
  );
};
