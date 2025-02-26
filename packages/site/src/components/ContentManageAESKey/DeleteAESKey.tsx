import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import { ContentBoldText, ContentButtons } from './styles';

export const DeleteAESKey = ({
  handleShowDelete,
}: {
  handleShowDelete: () => void;
}) => {
  const { deleteAESKey, loading } = useSnap();

  if (loading) {
    <Loading
      title="Delete your AES Key"
      actionText="Approve in your wallet to delete your AES key"
    />;
  }

  return (
    <>
      <ContentTitle>Delete your AES Key</ContentTitle>
      <ContentBoldText>
        Are you sure you want to remove the AES key from MetaMask account?
      </ContentBoldText>
      <ContentText>
        Without your AES Key you won't be able to see your private tokens and
        NFTs. You can acquire the AES back at anytime using a transaction to the
        network.
      </ContentText>
      <ContentButtons>
        <Button text="Cancel" fullWith onClick={handleShowDelete} />
        <Button error text="Delete" fullWith onClick={deleteAESKey} />
      </ContentButtons>
    </>
  );
};
