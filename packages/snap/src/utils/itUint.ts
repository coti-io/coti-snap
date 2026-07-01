import { prepareIT256 } from '@coti-io/coti-sdk-typescript';
import { BaseWallet, Wallet, hexlify, solidityPackedKeccak256 } from 'ethers';

export type ItUint256 = {
  ciphertext: {
    ciphertextHigh: string;
    ciphertextLow: string;
  };
  signature: string;
};

export const buildItUint256 = (
  plaintext: bigint,
  aesKey: string,
  wallet: BaseWallet,
  contractAddress: string,
  selector: string,
): ItUint256 => {
  const it = prepareIT256(
    plaintext,
    { wallet, userKey: aesKey } as unknown as Parameters<
      typeof prepareIT256
    >[1],
    contractAddress,
    selector,
  );

  return {
    ciphertext: {
      ciphertextHigh: it.ciphertext.ciphertextHigh.toString(),
      ciphertextLow: it.ciphertext.ciphertextLow.toString(),
    },
    signature: hexlify(it.signature),
  };
};

export const deriveSnapWallet = (
  aesKey: string,
  account: string,
  chainId: string,
): BaseWallet => {
  const seed = solidityPackedKeccak256(
    ['string', 'address', 'string', 'string'],
    ['coti-snap-encryption', account, chainId, aesKey],
  );
  return new Wallet(seed);
};
