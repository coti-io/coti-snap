import { render, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { useAccount } from 'wagmi';

import { SnapProvider, useSnap } from '../hooks/SnapContext';
import { useInvokeSnap } from '../hooks/useInvokeSnap';
import { useMetaMask } from '../hooks/useMetaMask';

jest.mock('./useInvokeSnap');
jest.mock('./useMetaMask');
jest.mock('wagmi');

const mockUseInvokeSnap = useInvokeSnap as jest.MockedFunction<
  typeof useInvokeSnap
>;
const mockUseMetaMask = useMetaMask as jest.MockedFunction<typeof useMetaMask>;
const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

describe('SnapContext', () => {
  beforeEach(() => {
    mockUseInvokeSnap.mockReturnValue(jest.fn());
    mockUseMetaMask.mockReturnValue({
      isFlask: false,
      snapsDetected: false,
      installedSnap: null,
      getSnap: jest.fn(),
    });
    mockUseAccount.mockReturnValue({
      address: '0x123',
      addresses: ['0x123'],
      chain: undefined,
      chainId: 1,
      connector: undefined,
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: true,
      status: 'reconnecting',
    });
  });

  const TestComponent = () => {
    const {
      userHasAESKey,
      setAESKey,
      getAESKey,
      deleteAESKey,
      userAESKey,
      setUserAesKEY,
      handleShowDelete,
      showDelete,
      loading,
      settingAESKeyError,
      onboardContractAddress,
      handleOnChangeContactAddress,
      handleCancelOnboard,
    } = useSnap();

    return (
      <div>
        <button
          onClick={() => {
            setAESKey().catch(console.error);
          }}
        >
          Set AES Key
        </button>
        <button
          onClick={() => {
            getAESKey().catch(console.error);
          }}
        >
          Get AES Key
        </button>
        <button
          onClick={() => {
            deleteAESKey().catch(console.error);
          }}
        >
          Delete AES Key
        </button>
        <button onClick={handleShowDelete}>Toggle Delete</button>
        <input
          value={onboardContractAddress}
          onChange={handleOnChangeContactAddress}
        />
        <button onClick={handleCancelOnboard}>Cancel Onboard</button>
        <div>{loading ? 'Loading...' : 'Not Loading'}</div>
        <div>{settingAESKeyError ? 'Error' : 'No Error'}</div>
        <div>{showDelete ? 'Show Delete' : 'Hide Delete'}</div>
        <div>{userHasAESKey ? 'Has AES Key' : 'No AES Key'}</div>
        <div>{userAESKey}</div>
      </div>
    );
  };

  it('renders without crashing', () => {
    render(
      <SnapProvider>
        <TestComponent />
      </SnapProvider>,
    );
  });

  it('toggles showDelete state', () => {
    const { getByText } = render(
      <SnapProvider>
        <TestComponent />
      </SnapProvider>,
    );

    const toggleButton = getByText('Toggle Delete');
    act(() => {
      toggleButton.click();
    });
    expect(getByText('Show Delete')).toBeInTheDocument();

    act(() => {
      toggleButton.click();
    });
    expect(getByText('Hide Delete')).toBeInTheDocument();
  });

  it('handles onboard contract address change', () => {
    const { getByDisplayValue } = render(
      <SnapProvider>
        <TestComponent />
      </SnapProvider>,
    );

    const input = getByDisplayValue('0x123') as HTMLInputElement;
    act(() => {
      input.value = '0x456';
      input.dispatchEvent(new Event('input'));
    });
    expect(getByDisplayValue('0x456')).toBeInTheDocument();
  });

  it('handles cancel onboard', () => {
    const { getByText, getByDisplayValue } = render(
      <SnapProvider>
        <TestComponent />
      </SnapProvider>,
    );

    const cancelButton = getByText('Cancel Onboard');
    act(() => {
      cancelButton.click();
    });
    expect(getByDisplayValue('0x123')).toBeInTheDocument();
  });

  // Additional tests for setAESKey, getAESKey, deleteAESKey can be added here
});
