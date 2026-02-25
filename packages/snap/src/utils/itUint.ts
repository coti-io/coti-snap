import {
  decodeUint,
  encodeKey,
  encodeUint,
  encrypt,
} from '@coti-io/coti-sdk-typescript';
import { ethers } from 'ethers';

type ItUint64 = {
  ciphertext: string;
  signature: string;
};

export type ItUint256 = {
  ciphertext: {
    high: { high: string; low: string };
    low: { high: string; low: string };
  };
  signature: [[string, string], [string, string]];
};

const buildSignature = (
  signerAddress: string,
  contractAddress: string,
  selector: string,
  ciphertext: bigint,
  privateKey: string,
): string => {
  const digest = ethers.solidityPackedKeccak256(
    ['address', 'address', 'bytes4', 'uint256'],
    [signerAddress, contractAddress, selector, ciphertext],
  );
  const signingKey = new ethers.SigningKey(privateKey);
  const sig = signingKey.sign(digest);
  const vByte = sig.v === 27 ? '0x00' : '0x01';
  return ethers.hexlify(ethers.concat([sig.r, sig.s, vByte]));
};

const buildItUint64 = (
  plaintext: bigint,
  aesKey: string,
  wallet: ethers.Wallet,
  contractAddress: string,
  selector: string,
): ItUint64 => {
  if (plaintext >= 2n ** 64n) {
    throw new RangeError('Plaintext size must be 64 bits or smaller.');
  }

  const plaintextBytes = encodeUint(plaintext);
  const keyBytes = encodeKey(aesKey);
  const { ciphertext, r } = encrypt(keyBytes, plaintextBytes);
  const ct = new Uint8Array([...ciphertext, ...r]);
  const ctInt = decodeUint(ct);
  const signature = buildSignature(
    wallet.address,
    contractAddress,
    selector,
    ctInt,
    wallet.privateKey,
  );

  return { ciphertext: ctInt.toString(), signature };
};

export const buildItUint256 = (
  plaintext: bigint,
  aesKey: string,
  wallet: ethers.Wallet,
  contractAddress: string,
  selector: string,
): ItUint256 => {
  const mask64 = (1n << 64n) - 1n;
  const d1 = (plaintext >> 192n) & mask64;
  const d2 = (plaintext >> 128n) & mask64;
  const d3 = (plaintext >> 64n) & mask64;
  const d4 = plaintext & mask64;

  const it1 = buildItUint64(d1, aesKey, wallet, contractAddress, selector);
  const it2 = buildItUint64(d2, aesKey, wallet, contractAddress, selector);
  const it3 = buildItUint64(d3, aesKey, wallet, contractAddress, selector);
  const it4 = buildItUint64(d4, aesKey, wallet, contractAddress, selector);

  return {
    ciphertext: {
      high: { high: it1.ciphertext, low: it2.ciphertext },
      low: { high: it3.ciphertext, low: it4.ciphertext },
    },
    signature: [
      [it1.signature, it2.signature],
      [it3.signature, it4.signature],
    ],
  };
};

export const deriveSnapWallet = (
  aesKey: string,
  account: string,
  chainId: string,
): ethers.Wallet => {
  const seed = ethers.solidityPackedKeccak256(
    ['string', 'address', 'string', 'string'],
    ['coti-snap-encryption', account, chainId, aesKey],
  );
  return new ethers.Wallet(seed);
};
