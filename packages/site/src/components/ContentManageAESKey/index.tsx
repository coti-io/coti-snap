 

import { useSnap } from '../../hooks/SnapContext';
import { ContentContainer } from '../styles';
import { DeleteAESKey } from './DeleteAESKey';
import { ManageAESKey } from './ManageAESKey';
import { OnboardAccount } from './OnboardAccount';

export const ContentManageAESKey = ({
  userHasAESKey,
}: {
  userHasAESKey: boolean;
}) => {
  const { showDelete, handleShowDelete } = useSnap();

  return (
    <ContentContainer>
      {userHasAESKey ? (
        showDelete ? (
          <DeleteAESKey handleShowDelete={handleShowDelete} />
        ) : (
          <ManageAESKey handleShowDelete={handleShowDelete} />
        )
      ) : (
        <OnboardAccount />
      )}
    </ContentContainer>
  );
};
