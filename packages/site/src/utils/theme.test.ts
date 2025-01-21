import { getLocalStorage, setLocalStorage } from './localStorage';
import { getThemePreference } from './theme';

jest.mock('./localStorage');

describe('getThemePreference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    expect(getThemePreference()).toBe(false);
    global.window = originalWindow;
  });

  it('should return true if system preference is dark and no local storage value', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      })),
    });

    (getLocalStorage as jest.Mock).mockReturnValue(null);

    expect(getThemePreference()).toBe(true);
    expect(setLocalStorage).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should return false if system preference is light and no local storage value', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
      })),
    });

    (getLocalStorage as jest.Mock).mockReturnValue(null);

    expect(getThemePreference()).toBe(false);
    expect(setLocalStorage).toHaveBeenCalledWith('theme', 'light');
  });

  it('should return true if local storage value is dark', () => {
    (getLocalStorage as jest.Mock).mockReturnValue('dark');

    expect(getThemePreference()).toBe(true);
    expect(setLocalStorage).not.toHaveBeenCalled();
  });

  it('should return false if local storage value is light', () => {
    (getLocalStorage as jest.Mock).mockReturnValue('light');

    expect(getThemePreference()).toBe(false);
    expect(setLocalStorage).not.toHaveBeenCalled();
  });
});
