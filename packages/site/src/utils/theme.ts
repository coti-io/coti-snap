import { getLocalStorage, setLocalStorage } from './localStorage';

/**
 * Get the user's preferred theme in local storage.
 *
 * @returns Always false (light theme).
 */
export const getThemePreference = () => {
  return false;
};
