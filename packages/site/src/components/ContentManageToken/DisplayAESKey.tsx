import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { SendButton } from './styles';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';

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
  background-color:rgb(241, 241, 241);
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
    
    path, circle, rect, polygon, ellipse {
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
  background-color: #1E29F6;
  color: #FFFFFF;
  border: 2px solid #1E29F6;
  
  &:hover {
    background-color: #f5f5f5;
    color: #FFFFFF;
  }
  
  &:active {
    background-color: #e3f2fd;
    color: #1E29F6;
  }
`;

const LaunchButton = styled(SendButton)`
  background-color: white;
  color: #1E29F6;
  border: 2px solid #1E29F6;
  
  &:hover {
    background-color: #f5f5f5;
    color: #FFFFFF;
  }
  
  &:active {
    background-color: #e3f2fd;
    color: #1E29F6;
  }
`;

const DeleteButton = styled(SendButton)`
  background-color: #dc3545;
  color: #FFFFFF;
  border: 2px solid #dc3545;
  
  &:hover {
    background-color: #c82333;
    border-color: #bd2130;
    border: 2px solid #FFFFFF !important;
  }
  
  &:active {
    background-color: #bd2130;
    border-color: #b21e2f;
  }
`;

interface DisplayAESKeyProps {
  aesKey: string;
  onLaunchDApp: () => void;
}

export const DisplayAESKey: React.FC<DisplayAESKeyProps> = ({
  aesKey,
  onLaunchDApp
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard({ successDuration: 1500 });
  const navigate = useNavigate();

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const handleCopy = () => {
    copyToClipboard(aesKey);
  };

  const handleDelete = () => {
    navigate('/delete');
  };

  const displayKey = isRevealed ? aesKey : '•'.repeat(aesKey.length);

  return (
    <Container>
      <Title>Manage your AES Key</Title>
      <Description>
        Your AES Key has been successfully retrieved. You can now reveal it or proceed to launch the dApp.
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
        <DeleteButton onClick={handleDelete}>
          Delete AES Key
        </DeleteButton>
        <LaunchButton onClick={onLaunchDApp}>
          Launch dApp
        </LaunchButton>
      </ButtonContainer>
    </Container>
  );
};