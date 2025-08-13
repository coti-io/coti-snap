import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import {
  ContentConnectYourWallet,
  ContentManageAESKey,
  ContentSwitchNetwork,
} from '../components';
import { ContentInstallAESKeyManager } from '../components/ContentInstallAESKeyManager';
import { ContentManageToken } from '../components/ContentManageToken';
import { DeleteAESKey } from '../components/ContentManageAESKey/DeleteAESKey';
import { ContentBorderWrapper, ContentContainer } from '../components/styles';
import { useMetaMask, useWrongChain } from '../hooks';
import { useSnap } from '../hooks/SnapContext';
import { SmartRouter } from './SmartRouter.js';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  
  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }
  
  return <>{children}</>;
}

function NetworkProtectedRoute({ children }: { children: React.ReactNode }) {
  const { wrongChain } = useWrongChain();
  
  if (wrongChain) {
    return <Navigate to="/network" replace />;
  }
  
  return <>{children}</>;
}

function SnapProtectedRoute({ children }: { children: React.ReactNode }) {
  const { installedSnap } = useMetaMask();
  
  if (!installedSnap) {
    return <Navigate to="/install" replace />;
  }
  
  return <>{children}</>;
}

function Dashboard() {
  const { userHasAESKey, userAESKey } = useSnap();
  
  return (
    <ContentManageAESKey userHasAESKey={userHasAESKey} userAESKey={userAESKey} />
  );
}

function TokenManagement() {
  const { userAESKey } = useSnap();
  
  return <ContentManageToken aesKey={userAESKey} />;
}

function DeleteAESKeyPage() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/wallet');
  };
  
  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <DeleteAESKey handleShowDelete={handleGoBack} />
      </ContentContainer>
    </ContentBorderWrapper>
  );
}

function RootRedirect() {
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();
  const { installedSnap } = useMetaMask();
  
  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }
  
  if (wrongChain) {
    return <Navigate to="/network" replace />;
  }
  
  if (!installedSnap) {
    return <Navigate to="/install" replace />;
  }
  
  return <Navigate to="/wallet" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SmartRouter />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: 'connect',
        element: <ContentConnectYourWallet />,
      },
      {
        path: 'network',
        element: (
          <ProtectedRoute>
            <ContentSwitchNetwork />
          </ProtectedRoute>
        ),
      },
      {
        path: 'install',
        element: (
          <ProtectedRoute>
            <NetworkProtectedRoute>
              <ContentInstallAESKeyManager />
            </NetworkProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'wallet',
        element: (
          <ProtectedRoute>
            <NetworkProtectedRoute>
              <SnapProtectedRoute>
                <Dashboard />
              </SnapProtectedRoute>
            </NetworkProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tokens',
        element: (
          <ProtectedRoute>
            <NetworkProtectedRoute>
              <SnapProtectedRoute>
                <TokenManagement />
              </SnapProtectedRoute>
            </NetworkProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'delete',
        element: (
          <ProtectedRoute>
            <NetworkProtectedRoute>
              <SnapProtectedRoute>
                <DeleteAESKeyPage />
              </SnapProtectedRoute>
            </NetworkProtectedRoute>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);