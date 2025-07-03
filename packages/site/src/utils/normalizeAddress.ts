import { isAddress } from 'ethers';

const isValidAddress = (address: string): boolean => {
  return isAddress(address);
}

export const normalizeAddress = (address: string): string => {
  if (!isValidAddress(address)) {
    return '';
  }
  return address;
}
