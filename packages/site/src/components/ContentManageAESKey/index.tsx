import React, { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { ContentBorderWrapper, ContentContainer } from '../styles';
import { ContentManageToken } from '../ContentManageToken';
import { DisplayAESKey } from '../ContentManageToken/DisplayAESKey';
import { OnboardAccount } from './OnboardAccount';
import { DeleteAESKey } from './DeleteAESKey';
import { useSnap } from '../../hooks/SnapContext';

interface ContentManageAESKeyProps {
  readonly userHasAESKey: boolean;
  readonly userAESKey: string | null;
}

interface AESKeyState {
  readonly showManage: boolean;
}

export const ContentManageAESKey: React.FC<ContentManageAESKeyProps> = ({ userHasAESKey, userAESKey }) => {
  const { address } = useAccount();
  const { onboardingStep } = useSnap();
  const [aesKeyState, setAesKeyState] = useState<AESKeyState>({
    showManage: false
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    setAesKeyState({
      showManage: false
    });
    setShowDeleteConfirmation(false);
  }, [address]);

  const shouldShowOnboarding = useMemo(() => {
    return !userHasAESKey || onboardingStep !== null;
  }, [userHasAESKey, onboardingStep]);

  const shouldShowTokenManagement = useMemo(() => 
    userHasAESKey && !aesKeyState.showManage && !showDeleteConfirmation, 
    [userHasAESKey, aesKeyState, showDeleteConfirmation]
  );

  const handleDeleteAESKey = () => {
    setShowDeleteConfirmation(true);
    setAesKeyState({ showManage: false });
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleNavigateToTokens = () => {
    setAesKeyState({ showManage: false });
  };

  const renderContent = (): JSX.Element | null => {

    if (shouldShowOnboarding) {
      return <OnboardAccount />;
    }

    if (showDeleteConfirmation) {
      return <DeleteAESKey handleShowDelete={handleCancelDelete} />;
    }

    if (aesKeyState.showManage && userAESKey) {
      return (
        <DisplayAESKey 
          aesKey={userAESKey}
          onNavigateToTokens={handleNavigateToTokens}
          onDeleteAESKey={handleDeleteAESKey}
        />
      );
    }

    if (shouldShowTokenManagement) {
      return <ContentManageToken aesKey={userAESKey} />;
    }

    return null;
  };

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
