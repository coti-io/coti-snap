import React, { useState, useMemo } from 'react';

import { ContentBorderWrapper, ContentContainer } from '../styles';
import { ContentManageToken } from '../ContentManageToken';
import { ManageAESKey } from './ManageAESKey';
import { OnboardAccount } from './OnboardAccount';

interface ContentManageAESKeyProps {
  readonly userHasAESKey: boolean;
  readonly userAESKey: string | null;
}

interface AESKeyState {
  readonly showManage: boolean;
}

export const ContentManageAESKey: React.FC<ContentManageAESKeyProps> = ({ userHasAESKey, userAESKey }) => {
  const [aesKeyState, setAesKeyState] = useState<AESKeyState>({
    showManage: false
  });

  const shouldShowOnboarding = useMemo(() => !userHasAESKey, [userHasAESKey]);
  const shouldShowTokenManagement = useMemo(() => userHasAESKey && !aesKeyState.showManage, [userHasAESKey, aesKeyState]);

  const handleToggleManage = () => {
    setAesKeyState(prev => ({
      ...prev,
      showManage: !prev.showManage
    }));
  };


  const renderContent = (): JSX.Element | null => {
    if (shouldShowOnboarding) {
      return <OnboardAccount />;
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
    <ContentBorderWrapper>
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
