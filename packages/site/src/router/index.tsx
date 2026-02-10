import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { SmartRouter } from './SmartRouter.js';
import {
  ContentConnectYourWallet,
  ContentManageAESKey,
  ContentSwitchNetwork,
} from '../components';
import { ContentInstallAESKeyManager } from '../components/ContentInstallAESKeyManager';
import { PermissionGuard } from '../components/PermissionGuard';
import { useMetaMask, useWrongChain } from '../hooks';
import { useSnap } from '../hooks/SnapContext';

/**
 *
 * @param options0
 * @param options0.children
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
}

/**
 *
 * @param options0
 * @param options0.children
 */
function NetworkProtectedRoute({ children }: { children: React.ReactNode }) {
  const { wrongChain } = useWrongChain();

  if (wrongChain) {
    return <Navigate to="/network" replace />;
  }

  return <>{children}</>;
}

/**
 *
 * @param options0
 * @param options0.children
 */
function SnapProtectedRoute({ children }: { children: React.ReactNode }) {
  const { installedSnap } = useMetaMask();

  if (!installedSnap) {
    return <Navigate to="/install" replace />;
  }

  return <>{children}</>;
}

/**
 *
 * @param options0
 * @param options0.children
 */
function InstallProtectedRoute({ children }: { children: React.ReactNode }) {
  const { installedSnap } = useMetaMask();

  if (installedSnap) {
    return <Navigate to="/wallet" replace />;
  }

  return <>{children}</>;
}

/**
 *
 */
function Dashboard() {
  const { userHasAESKey, userAESKey } = useSnap();

  return (
    <PermissionGuard>
      <ContentManageAESKey
        userHasAESKey={userHasAESKey}
        userAESKey={userAESKey}
      />
    </PermissionGuard>
  );
}

/**
 *
 */
function TokenManagement() {
  const { userHasAESKey, userAESKey } = useSnap();
  return (
    <PermissionGuard>
      <ContentManageAESKey
        userHasAESKey={userHasAESKey}
        userAESKey={userAESKey}
      />
    </PermissionGuard>
  );
}

/**
 *
 */
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
              <InstallProtectedRoute>
                <ContentInstallAESKeyManager />
              </InstallProtectedRoute>
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
    ],
  },
]);
