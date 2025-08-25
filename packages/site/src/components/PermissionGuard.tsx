import type { ReactNode } from 'react';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useSnap } from '../hooks/SnapContext';
import { useMetaMask } from '../hooks';
import { useInvokeSnap } from '../hooks/useInvokeSnap';
import { ContentText, ContentTitle, ContentBorderWrapper, ContentContainer } from './styles';
import { Loading } from './Loading';

interface PermissionCheckResult {
  hasPermission: boolean;
  currentAccount: string;
  permittedAccounts: string[];
}

interface PermissionGuardProps {
  readonly children: ReactNode;
}

type PermissionState = boolean | null;

const PRESERVED_STORAGE_KEYS = [
  'snap_onboarding_completed',
] as const;

const clearTemporarySnapStorage = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (PRESERVED_STORAGE_KEYS.some(preserved => key === preserved)) {
      return;
    }
  });
};

const isPermissionDenied = (snapError: string | null, localError: PermissionState): boolean => {
  return snapError === 'accountPermissionDenied' || localError === true;
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const { settingAESKeyError } = useSnap();
  const { address, isConnected } = useAccount();
  const { installedSnap } = useMetaMask();
  const invokeSnap = useInvokeSnap();
  
  const [localPermissionError, setLocalPermissionError] = useState<PermissionState>(null);
  
  const checkingRef = useRef<boolean>(false);
  const checkedAccountRef = useRef<string | null>(null);

  const shouldShowPermissionDenied = useMemo(
    () => isPermissionDenied(settingAESKeyError, localPermissionError),
    [settingAESKeyError, localPermissionError]
  );

  const isCheckingPermissions = useMemo(
    () => localPermissionError === null && checkingRef.current,
    [localPermissionError]
  );

  const canCheckPermissions = useMemo(
    () => Boolean(address && isConnected && installedSnap),
    [address, isConnected, installedSnap]
  );

  useEffect(() => {
    if (shouldShowPermissionDenied) {
      clearTemporarySnapStorage();
    }
  }, [shouldShowPermissionDenied]);

  const checkPermissions = useCallback(async (): Promise<void> => {
    if (!canCheckPermissions || checkingRef.current || checkedAccountRef.current === (address ?? null)) {
      return;
    }

    if (settingAESKeyError === 'accountPermissionDenied') {
      setLocalPermissionError(true);
      checkedAccountRef.current = address ?? null;
      return;
    }

    checkingRef.current = true;
    checkedAccountRef.current = address || null;
    
    try {
      const result = await invokeSnap({
        method: 'check-account-permissions',
        params: { targetAccount: address }
      }) as PermissionCheckResult | null;
              
      setLocalPermissionError(result ? !result.hasPermission : false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('No account connected')) {
        setLocalPermissionError(false);
      } else {
        console.error('PermissionGuard: Failed to check permissions:', error);
        setLocalPermissionError(true);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [address, canCheckPermissions, settingAESKeyError, invokeSnap]);

  useEffect(() => {
    void checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (checkedAccountRef.current !== (address ?? null)) {
      setLocalPermissionError(null);
      checkedAccountRef.current = null;
    }
  }, [address]);

  if (shouldShowPermissionDenied) {
    return (
      <ContentBorderWrapper>
        <ContentContainer>
          <ContentTitle>Snap Reinstallation Required</ContentTitle>
          <ContentText style={{ marginTop: '16px' }}>
          To make sure everything works smoothly, please remove and reinstall the COTI Snap in MetaMask.
          When reinstalling, we recommend granting permissions to all your accounts. 
          This will help you switch between wallet addresses seamlessly, 
          without running into access issues later.
          </ContentText>
        </ContentContainer>
      </ContentBorderWrapper>
    );
  }

  if (isCheckingPermissions) {
    return (
      <ContentBorderWrapper>
        <ContentContainer>
          <Loading title="Checking permissions..." actionText="" />
        </ContentContainer>
      </ContentBorderWrapper>
    );
  }

  return <>{children}</>;
};

PermissionGuard.displayName = 'PermissionGuard';