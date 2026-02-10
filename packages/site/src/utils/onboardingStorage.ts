const ONBOARDING_KEY = 'snap_onboarding_completed';

type OnboardingData = {
  [key: string]: boolean;
};

const buildStorageKey = (
  address: string,
  chainId?: number | string | null,
): string => {
  const normalizedAddress = address.toLowerCase();
  if (chainId === undefined || chainId === null) {
    return normalizedAddress;
  }
  return `${normalizedAddress}:${chainId}`;
};

/**
 * Get onboarding data from localStorage
 */
const getOnboardingData = (): OnboardingData => {
  try {
    const data = localStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    void error;
    return {};
  }
};

/**
 * Save onboarding data to localStorage
 * @param data
 */
const saveOnboardingData = (data: OnboardingData): void => {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  } catch (error) {
    void error;
  }
};

/**
 * Check if an address has completed onboarding
 * @param address
 * @param chainId
 */
export const hasCompletedOnboarding = (
  address: string,
  chainId?: number | string | null,
): boolean => {
  if (!address) {
    return false;
  }

  const data = getOnboardingData();

  if (chainId !== undefined && chainId !== null) {
    const keyWithChain = buildStorageKey(address, chainId);
    if (keyWithChain in data) {
      return Boolean(data[keyWithChain]);
    }

    const legacyKey = buildStorageKey(address);
    if (legacyKey in data) {
      const migratedData = { ...data };
      migratedData[keyWithChain] = Boolean(migratedData[legacyKey]);
      delete migratedData[legacyKey];
      saveOnboardingData(migratedData);
      return Boolean(migratedData[keyWithChain]);
    }

    return false;
  }

  return Boolean(data[buildStorageKey(address)]);
};

/**
 * Mark an address as having completed onboarding
 * @param address
 * @param chainId
 */
export const setOnboardingCompleted = (
  address: string,
  chainId?: number | string | null,
): void => {
  if (!address || chainId === undefined || chainId === null) {
    return;
  }

  const data = getOnboardingData();

  data[buildStorageKey(address, chainId)] = true;
  delete data[buildStorageKey(address)];

  saveOnboardingData(data);
};

/**
 * Clear onboarding status for an address (useful for testing or reset)
 * @param address
 * @param chainId
 */
export const clearOnboardingCompleted = (
  address: string,
  chainId?: number | string | null,
): void => {
  if (!address) {
    return;
  }

  const data = getOnboardingData();
  if (chainId === undefined || chainId === null) {
    delete data[buildStorageKey(address)];
  } else {
    delete data[buildStorageKey(address, chainId)];
    delete data[buildStorageKey(address)];
  }
  saveOnboardingData(data);
};

/**
 * Clear all onboarding data (useful for complete reset)
 */
export const clearAllOnboardingData = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    void error;
  }
};
