import type { Snap } from '../types';
import { shouldDisplayReconnectButton } from '../utils/button';
import { isLocalSnap } from '../utils/snap';

jest.mock('../utils/snap', () => ({
  isLocalSnap: jest.fn(),
}));

describe('shouldDisplayReconnectButton', () => {
  it('should return false if isLocalSnap returns false', () => {
    const mockSnap: Snap = {
      id: 'test-snap',
      permissionName: 'test-permission',
      version: '1.0.0',
      initialPermissions: {},
    };
    (isLocalSnap as jest.Mock).mockReturnValue(false);
    expect(shouldDisplayReconnectButton(mockSnap)).toBe(false);
  });

  it('should return true if isLocalSnap returns true', () => {
    const mockSnap: Snap = {
      id: 'test-snap',
      permissionName: 'test-permission',
      version: '1.0.0',
      initialPermissions: {},
    };
    (isLocalSnap as jest.Mock).mockReturnValue(true);
    expect(shouldDisplayReconnectButton(mockSnap)).toBe(true);
  });
});
