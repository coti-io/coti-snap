import React, { useState } from 'react';
import styled from 'styled-components';

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

const CopyIcon = styled.button`
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

export const ManageAESKey = () => {
  const [value] = useState<string>(
    '0x3A5470Fa1cF02B6f96CB1E678d93B6D63b571444',
  );
  const [reveal, setReveal] = useState<boolean>(false);
  return (
    <>
      <ContentTitle>Manage your AES Key</ContentTitle>
      <ContentInput>
        <ContentText>AES Key</ContentText>
        <AESKeyContainer>
          {reveal ? (
            <>
              <EditableInput type="text" value={value} readOnly={true} />
              <CopyIcon>
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_694_292)">
                    <path d="M15.053 3.81641H5.579C5.16063 3.81772 4.75977 3.98451 4.46393 4.28034C4.1681 4.57618 4.00132 4.97704 4 5.39541V16.4484H5.579V5.39541H15.053V3.81641ZM17.421 6.97441H8.737C8.31863 6.97572 7.91777 7.14251 7.62193 7.43834C7.3261 7.73418 7.15932 8.13504 7.158 8.55341V19.6054C7.15932 20.0238 7.3261 20.4246 7.62193 20.7205C7.91777 21.0163 8.31863 21.1831 8.737 21.1844H17.421C17.8394 21.1831 18.2402 21.0163 18.5361 20.7205C18.8319 20.4246 18.9987 20.0238 19 19.6054V8.55341C18.9987 8.13504 18.8319 7.73418 18.5361 7.43834C18.2402 7.14251 17.8394 6.97572 17.421 6.97441ZM17.421 19.6064H8.737V8.55341H17.421V19.6064Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_694_292">
                      <rect
                        width="24"
                        height="24"
                        fill="white"
                        transform="translate(0 0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </CopyIcon>
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
      <Button text="Delete" primary={false} />
    </>
  );
};
