import React, { useState, useMemo } from 'react';

import { ContentContainer } from '../styles';
import { ContentManageToken } from '../ContentManageToken';
import { DeleteAESKey } from './DeleteAESKey';
import { ManageAESKey } from './ManageAESKey';
import { OnboardAccount } from './OnboardAccount';

interface ContentManageAESKeyProps {
  readonly userHasAESKey: boolean;
  readonly userAESKey: string | null;
}

interface AESKeyState {
  readonly showDelete: boolean;
  readonly showManage: boolean;
}

export const ContentManageAESKey: React.FC<ContentManageAESKeyProps> = ({ userHasAESKey, userAESKey }) => {
  const [aesKeyState, setAesKeyState] = useState<AESKeyState>({
    showDelete: false,
    showManage: false
  });

  const shouldShowOnboarding = useMemo(() => !userHasAESKey, [userHasAESKey]);
  const shouldShowTokenManagement = useMemo(() => userHasAESKey && !aesKeyState.showDelete && !aesKeyState.showManage, [userHasAESKey, aesKeyState]);

  const handleToggleDelete = () => {
    setAesKeyState(prev => ({
      ...prev,
      showDelete: !prev.showDelete,
      showManage: false
    }));
  };

  const handleToggleManage = () => {
    setAesKeyState(prev => ({
      ...prev,
      showManage: !prev.showManage,
      showDelete: false
    }));
  };


  const renderContent = (): JSX.Element | null => {
    if (shouldShowOnboarding) {
      return <OnboardAccount />;
    }

    if (aesKeyState.showDelete) {
      return <DeleteAESKey handleShowDelete={handleToggleDelete} />;
    }

    if (aesKeyState.showManage) {
      return <ManageAESKey handleShowDelete={handleToggleManage} />;
    }

    if (shouldShowTokenManagement) {
      return <ContentManageToken aesKey={userAESKey} />;
    }

    return null;
  };

  return (
    <ContentContainer>
      {renderContent()}
    </ContentContainer>
  );
};
