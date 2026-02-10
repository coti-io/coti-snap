import React, { useState, useCallback, memo, useTransition } from 'react';
import styled from 'styled-components';

import { SendButton } from './styles';
import CopySuccessIcon from '../../assets/copy-success.svg';
import CopyIcon from '../../assets/copy.svg';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0px 12px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #18191d !important;
`;

const Description = styled.p`
  font-size: 16px;
  color: #18191d !important;
  line-height: 1.5;
  font-weight: 450;
`;

const AESKeyContainerMax = styled.div`
  border-radius: 8px;
  word-break: break-all;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const AESKeyContainer = styled.div`
  border-radius: 8px;
  word-break: break-all;
  display: flex;
  padding: 4px 16px;
  background-color: rgb(241, 241, 241);
  justify-content: space-between;
  align-items: center;
`;

const AESKeyText = styled.code`
  font-family: monospace;
  font-size: 14px;
  color: #333;
  flex: 1;
  width: 100%;
  background-color: #rgb(241, 241, 241);
  border-radius: 8px;
  text-align: start;
`;

const CopyIconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #000000 !important;

    * {
      color: #000000 !important;
    }

    path,
    circle,
    rect,
    polygon,
    ellipse {
      stroke: #000000 !important;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const RevealButton = styled(SendButton)`
  background-color: #1e29f6;
  color: #ffffff;
  border: 2px solid #1e29f6;

  &:hover {
    background-color: #f5f5f5;
    color: #ffffff;
  }

  &:active {
    background-color: #e3f2fd;
    color: #1e29f6;
  }
`;

const LaunchButton = styled(SendButton)`
  background-color: white;
  color: #1e29f6;
  border: 2px solid #1e29f6;

  &:hover {
    background-color: #f5f5f5;
    color: #ffffff;
  }

  &:active {
    background-color: #e3f2fd;
    color: #1e29f6;
  }
`;

const DeleteButton = styled(SendButton)`
  background-color: #dc3545;
  color: #ffffff;
  border: 2px solid #dc3545;
  transition: none;

  &:hover:not(:disabled) {
    background-color: #c82333;
    border-color: #bd2130;
  }

  &:active {
    background-color: #bd2130;
    border-color: #b21e2f;
  }
`;

type DisplayAESKeyProps = {
  aesKey: string;
  onLaunchDApp?: () => void;
  onNavigateToTokens?: () => void;
  onDeleteAESKey: () => void;
};

export const DisplayAESKey: React.FC<DisplayAESKeyProps> = memo(
  ({ aesKey, onLaunchDApp, onNavigateToTokens, onDeleteAESKey }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [, startTransition] = useTransition();
    const { copied, copyToClipboard } = useCopyToClipboard({
      successDuration: 1500,
    });

    const handleReveal = useCallback(() => {
      startTransition(() => {
        setIsRevealed(!isRevealed);
      });
    }, [isRevealed]);

    const handleCopy = useCallback(() => {
      startTransition(() => {
        copyToClipboard(aesKey);
      });
    }, [copyToClipboard, aesKey]);

    const handleDelete = useCallback(() => {
      startTransition(() => {
        onDeleteAESKey();
      });
    }, [onDeleteAESKey]);

    const displayKey = isRevealed ? aesKey : '•'.repeat(aesKey.length);

    return (
      <Container>
        <Title>Key Management</Title>
        <Description>
          Your AES Key has been successfully retrieved. You can now reveal it or
          proceed to launch the dApp.
        </Description>
        <AESKeyContainerMax>
          <AESKeyContainer>
            <AESKeyText>{displayKey}</AESKeyText>
            {isRevealed && (
              <CopyIconWrapper onClick={handleCopy}>
                {copied ? <CopySuccessIcon /> : <CopyIcon />}
              </CopyIconWrapper>
            )}
          </AESKeyContainer>
        </AESKeyContainerMax>
        <ButtonContainer>
          <RevealButton onClick={handleReveal}>
            {isRevealed ? 'Hide' : 'Reveal'}
          </RevealButton>
          <DeleteButton onClick={handleDelete}>Delete AES Key</DeleteButton>
          <LaunchButton onClick={onNavigateToTokens || onLaunchDApp}>
            {onNavigateToTokens ? 'View Tokens' : 'Launch dApp'}
          </LaunchButton>
        </ButtonContainer>
      </Container>
    );
  },
);

DisplayAESKey.displayName = 'DisplayAESKey';
