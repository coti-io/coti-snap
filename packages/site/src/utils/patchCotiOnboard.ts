import type { JsonRpcSigner } from '@coti-io/coti-ethers/dist/providers/JsonRpcSigner';
import type { Wallet } from '@coti-io/coti-ethers/dist/wallet/Wallet';
import { recoverUserKey, generateRSAKeyPair } from '@coti-io/coti-sdk-typescript';
import * as onboardModule from '@coti-io/coti-ethers/dist/utils/onboard';

type OnboardFn = typeof onboardModule.onboard;
type GetAccountOnboardContractFn = typeof onboardModule.getAccountOnboardContract;

interface CotiOnboardModule {
  onboard: OnboardFn;
  getAccountOnboardContract: GetAccountOnboardContractFn;
  hexViewPatched?: boolean;
}

type AccountOnboardContract = ReturnType<GetAccountOnboardContractFn> & {
  onboardAccount: (
    publicKey: `0x${string}`,
    signedEK: string,
    overrides?: { gasLimit?: number | bigint }
  ) => Promise<{
    wait: () => Promise<{
      logs?: Array<{ [key: string]: unknown } | undefined>;
      hash: string;
    }>;
  }>;
  interface: {
    parseLog: (log: unknown) => {
      args: {
        userKey1: string;
        userKey2: string;
      };
    } | null;
  };
};

const moduleRef = onboardModule as unknown as CotiOnboardModule;

if (!moduleRef.hexViewPatched) {
  const originalOnboard = moduleRef.onboard;
  const patchedOnboard: OnboardFn = async (defaultOnboardContractAddress, signer) => {
    const toHex = (bytes: Uint8Array): `0x${string}` => `0x${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;

    if ((signer as Wallet).privateKey) {
      return originalOnboard(defaultOnboardContractAddress, signer);
    }

    try {
      const accountOnboardContract = moduleRef.getAccountOnboardContract(
        defaultOnboardContractAddress,
        signer
      ) as AccountOnboardContract;
      const { publicKey, privateKey } = generateRSAKeyPair();
      const publicKeyHex = toHex(publicKey);

      const signedEK = await (signer as JsonRpcSigner).signMessage(publicKeyHex);

      const receipt = await (await accountOnboardContract.onboardAccount(publicKeyHex, signedEK, { gasLimit: 12000000 })).wait();
      if (!receipt || !receipt.logs || !receipt.logs[0]) {
        throw new Error('failed to onboard account');
      }

      const decodedLog = accountOnboardContract.interface.parseLog(receipt.logs[0]);
      if (!decodedLog) {
        throw new Error('failed to onboard account');
      }

      const userKey1 = decodedLog.args.userKey1.substring(2);
      const userKey2 = decodedLog.args.userKey2.substring(2);

      return {
        aesKey: recoverUserKey(privateKey, userKey1, userKey2),
        rsaKey: { publicKey, privateKey },
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('unable to onboard user.');
      throw Error('unable to onboard user.');
    }
  };

  moduleRef.onboard = patchedOnboard;
  moduleRef.hexViewPatched = true;
}
