import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useSnap } from '../hooks/SnapContext';
import { ContentText, ContentTitle, ContentBorderWrapper, ContentContainer } from './styles';

interface PermissionGuardProps {
  readonly children: ReactNode;
}

const STORAGE_KEY_PREFIXES = ['snap_', 'onboard', 'aes'] as const;

const clearSnapRelatedStorage = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (STORAGE_KEY_PREFIXES.some(prefix => key.startsWith(prefix) || key.includes(prefix))) {
      localStorage.removeItem(key);
    }
  });
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const { settingAESKeyError } = useSnap();

  useEffect(() => {
    if (settingAESKeyError === 'accountPermissionDenied') {
      clearSnapRelatedStorage();
    }
  }, [settingAESKeyError]);

  if (settingAESKeyError === 'accountPermissionDenied') {
    return (
      <ContentBorderWrapper>
        <ContentContainer>
          <ContentTitle>Snap Reinstallation Required</ContentTitle>
          <ContentText>
            This account does not have permissions to interact with the COTI Snap.
            You need to remove and reinstall the COTI Snap from MetaMask, making sure
            to grant permissions for ALL accounts during installation. This ensures
            you can seamlessly switch between different wallet addresses without issues.
          </ContentText>
          <ContentText style={{ marginTop: '16px', fontWeight: 'bold' }}>
            Recommendation: Grant permissions to all your accounts during snap installation
            to avoid this issue when switching between wallets.
          </ContentText>
        </ContentContainer>
      </ContentBorderWrapper>
    );
  }

  return <>{children}</>;
};

PermissionGuard.displayName = 'PermissionGuard';