import { isLocalSnap } from './snap';

describe('isLocalSnap', () => {
  it('should return true for local snap ID', () => {
    const snapId = 'local:example';
    expect(isLocalSnap(snapId)).toBe(true);
  });

  it('should return false for non-local snap ID', () => {
    const snapId = 'npm:example';
    expect(isLocalSnap(snapId)).toBe(false);
  });

  it('should return false for empty snap ID', () => {
    const snapId = '';
    expect(isLocalSnap(snapId)).toBe(false);
  });

  it('should return false for snap ID without local prefix', () => {
    const snapId = 'example';
    expect(isLocalSnap(snapId)).toBe(false);
  });
});
