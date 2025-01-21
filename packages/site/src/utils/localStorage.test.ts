import { getLocalStorage, setLocalStorage } from './localStorage';

describe('getLocalStorage', () => {
  it('should return the value from local storage if the key exists', () => {
    const value = 'dark';
    const getItemMock = jest.fn().mockReturnValue(value);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock,
      },
      writable: true,
    });

    const result = getLocalStorage('testKey');
    expect(result).toBe(value);
    expect(getItemMock).toHaveBeenCalledWith('testKey');
  });

  it('should throw an error if local storage is not available', () => {
    Object.defineProperty(window, 'localStorage', {
      value: null,
      writable: true,
    });

    expect(() => getLocalStorage('testKey')).toThrow(
      'Local storage is not available.',
    );
  });
});

describe('setLocalStorage', () => {
  it('should set the value in local storage', () => {
    const setItemMock = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: setItemMock,
      },
      writable: true,
    });

    setLocalStorage('testKey', 'dark');
    expect(setItemMock).toHaveBeenCalledWith('testKey', 'dark');
  });

  it('should throw an error if local storage is not available', () => {
    Object.defineProperty(window, 'localStorage', {
      value: null,
      writable: true,
    });

    expect(() => setLocalStorage('testKey', 'dark')).toThrow(
      'Local storage is not available.',
    );
  });
});
