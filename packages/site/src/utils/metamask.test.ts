import {
  hasSnapsSupport,
  getMetaMaskEIP6963Provider,
  getSnapsProvider,
} from './metamask';

describe('metamask utils', () => {
  describe('hasSnapsSupport', () => {
    it('should return true if provider supports snaps', async () => {
      const mockProvider = {
        request: jest.fn().mockResolvedValueOnce(true),
      };

      const result = await hasSnapsSupport(mockProvider as any);
      expect(result).toBe(true);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_getSnaps',
      });
    });

    it('should return false if provider does not support snaps', async () => {
      const mockProvider = {
        request: jest.fn().mockRejectedValueOnce(new Error('Method not found')),
      };

      const result = await hasSnapsSupport(mockProvider as any);
      expect(result).toBe(false);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_getSnaps',
      });
    });
  });

  describe('getMetaMaskEIP6963Provider', () => {
    it('should return a MetaMask provider if found', async () => {
      const mockProvider = { isMetaMask: true };
      const mockEvent = new CustomEvent('eip6963:announceProvider', {
        detail: {
          info: { rdns: 'io.metamask' },
          provider: mockProvider,
        },
      });

      setTimeout(() => {
        window.dispatchEvent(mockEvent);
      }, 100);

      const result = await getMetaMaskEIP6963Provider();
      expect(result).toBe(mockProvider);
    });

    it('should return null if no MetaMask provider is found after 500ms', async () => {
      const result = await getMetaMaskEIP6963Provider();
      expect(result).toBeNull();
    });
  });

  describe('getSnapsProvider', () => {
    it('should return the default provider if it supports snaps', async () => {
      const mockProvider = {
        request: jest.fn().mockResolvedValueOnce(true),
      };
      (window as any).ethereum = mockProvider;

      const result = await getSnapsProvider();
      expect(result).toBe(mockProvider);
    });

    it('should return the first detected provider that supports snaps', async () => {
      const mockProvider1 = {
        request: jest.fn().mockRejectedValueOnce(new Error('Method not found')),
      };
      const mockProvider2 = {
        request: jest.fn().mockResolvedValueOnce(true),
      };
      (window as any).ethereum = {
        detected: [mockProvider1, mockProvider2],
      };

      const result = await getSnapsProvider();
      expect(result).toBe(mockProvider2);
    });

    it('should return the first provider in the providers array that supports snaps', async () => {
      const mockProvider1 = {
        request: jest.fn().mockRejectedValueOnce(new Error('Method not found')),
      };
      const mockProvider2 = {
        request: jest.fn().mockResolvedValueOnce(true),
      };
      (window as any).ethereum = {
        providers: [mockProvider1, mockProvider2],
      };

      const result = await getSnapsProvider();
      expect(result).toBe(mockProvider2);
    });
  });
});
