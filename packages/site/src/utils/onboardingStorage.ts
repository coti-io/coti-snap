/**
 * Utility functions to manage onboarding state persistence in localStorage
 * Stores onboarding completion status per wallet address
 */

const ONBOARDING_KEY = 'snap_onboarding_completed';

interface OnboardingData {
  [address: string]: boolean;
}

/**
 * Get onboarding data from localStorage
 */
const getOnboardingData = (): OnboardingData => {
  try {
    const data = localStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Failed to read onboarding data from localStorage:', error);
    return {};
  }
};

/**
 * Save onboarding data to localStorage
 */
const saveOnboardingData = (data: OnboardingData): void => {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save onboarding data to localStorage:', error);
  }
};

/**
 * Check if an address has completed onboarding
 */
export const hasCompletedOnboarding = (address: string): boolean => {
  if (!address) return false;
  
  const data = getOnboardingData();
  return Boolean(data[address.toLowerCase()]);
};

/**
 * Mark an address as having completed onboarding
 */
export const setOnboardingCompleted = (address: string): void => {
  if (!address) return;
  
  const data = getOnboardingData();
  data[address.toLowerCase()] = true;
  saveOnboardingData(data);
};

/**
 * Clear onboarding status for an address (useful for testing or reset)
 */
export const clearOnboardingCompleted = (address: string): void => {
  if (!address) return;
  
  const data = getOnboardingData();
  delete data[address.toLowerCase()];
  saveOnboardingData(data);
};

/**
 * Clear all onboarding data (useful for complete reset)
 */
export const clearAllOnboardingData = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.warn('Failed to clear onboarding data from localStorage:', error);
  }
};