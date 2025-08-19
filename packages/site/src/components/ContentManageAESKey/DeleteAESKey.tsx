import React from 'react';

import { useSnap } from '../../hooks/SnapContext';
import { ButtonCancelWhite, ButtonDeleteRed } from '../Button';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import { ContentBoldText, ContentButtons } from './styles';

interface DeleteAESKeyProps {
  readonly handleShowDelete: () => void;
}

export const DeleteAESKey: React.FC<DeleteAESKeyProps> = ({
  handleShowDelete,
}) => {
  const { deleteAESKey, loading } = useSnap();

  const handleDeleteClick = async (): Promise<void> => {
    try {
      await deleteAESKey();
      handleShowDelete();
    } catch (error) {
      console.error('Error during AES key deletion:', error);
    }
  };

  if (loading) {
    return (
      <Loading
        title="Key Management"
        actionText="Approve in your wallet to delete your AES key"
      />
    );
  }

  return (
    <>
      <ContentTitle>Key Management</ContentTitle>
      <ContentBoldText>
        Are you sure you want to remove the AES key from MetaMask account?
      </ContentBoldText>
      <ContentText>
        Without your AES Key you won't be able to see your private tokens and
        NFTs. You can acquire the AES back at anytime using a transaction to the
        network.
      </ContentText>
      <ContentButtons>
        <ButtonCancelWhite 
          text="Cancel" 
          fullWidth 
          onClick={handleShowDelete}
          aria-label="Cancel deletion"
        />
        <ButtonDeleteRed 
          text="Delete" 
          fullWidth 
          onClick={handleDeleteClick}
          aria-label="Confirm deletion of AES key"
        />
      </ContentButtons>
    </>
  );
};
