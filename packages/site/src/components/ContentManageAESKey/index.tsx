import React, { useState } from 'react';

import { DeleteAESKey } from './DeleteAESKey';
import { ManageAESKey } from './ManageAESKey';
import { ContentContainer } from './style';

export const ContentManageAESKey = () => {
  const [showDelete, setShowDelete] = useState(false);

  const handleShowDelete = () => {
    setShowDelete(!showDelete);
  };

  return (
    <ContentContainer>
      {}
      {/*
      <OnboardAccount />
      */}

      {showDelete ? (
        <DeleteAESKey handleShowDelete={handleShowDelete} />
      ) : (
        <ManageAESKey handleShowDelete={handleShowDelete} />
      )}
    </ContentContainer>
  );
};
