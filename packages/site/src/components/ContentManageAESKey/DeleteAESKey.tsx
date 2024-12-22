import React from 'react';

import { Button } from '../Button';
import {
  ContentBoldText,
  ContentButtons,
  ContentText,
  ContentTitle,
} from './style';

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
