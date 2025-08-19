import React, { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { ContentBorderWrapper, ContentContainer } from '../styles';
import { ContentManageToken } from '../ContentManageToken';
import { ManageAESKey } from './ManageAESKey';
import { OnboardAccount } from './OnboardAccount';
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

  useEffect(() => {
    setAesKeyState({
      showManage: false
    });
  }, [address]);

  const shouldShowOnboarding = useMemo(() => {
    return !userHasAESKey || onboardingStep !== null;
  }, [userHasAESKey, onboardingStep]);

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
