import React from 'react';
import styled from 'styled-components';

import { Button } from '../Button';

const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
`;

const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: 400;
  margin: 0;
`;

const ContentBoldText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: bold;
  margin: 0;
`;

const ContentButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const DeleteAESKey = ({
  handleShowDelete,
}: {
  handleShowDelete: () => void;
}) => {
  return (
    <>
      <ContentTitle>Delete your AES Key</ContentTitle>
      <ContentBoldText>
        Are you sure you want to remove your account?
      </ContentBoldText>
      <ContentText>
        Without your AES Key you will not be able to see your tokens and nfts,
        you can also create another one to see your encrypted data.
      </ContentText>
      <ContentButtons>
        <Button text="Cancel" fullWith onClick={handleShowDelete} />
        <Button
          error
          text="Delete"
          fullWith
          onClick={() => console.log('delete')}
        />
      </ContentButtons>
    </>
  );
};
