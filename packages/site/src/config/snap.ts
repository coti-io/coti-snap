const isTestnet = (): boolean => {
    return import.meta.env.VITE_NODE_ENV === 'testnet';
};

const isSnapLocal = (): boolean => {
  return import.meta.env.VITE_SNAP_ENV === 'local';
};

const isMainnet = (): boolean => {
    return import.meta.env.VITE_NODE_ENV === 'mainnet';
};

const buildSnapOrigin = (): string => {
    if (isSnapLocal()) {
        return 'local:http://localhost:8080';
    } else if (isMainnet()) {
        return 'npm:@coti-io/coti-snap';
    } else {
        console.warn('VITE_NODE_ENV must be either "testnet" or "mainnet"');
        return 'npm:@coti-io/coti-snap';
    }
};

export const defaultSnapOrigin = buildSnapOrigin();

export { isTestnet, isMainnet, buildSnapOrigin };
