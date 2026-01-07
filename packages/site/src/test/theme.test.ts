import { getThemePreference } from '../utils/theme';

describe('getThemePreference', () => {
  it('should always return false (light theme)', () => {
    // Current implementation always returns false (light theme only)
    expect(getThemePreference()).toBe(false);
  });
});
