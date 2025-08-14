const isLocal = (): boolean => {
    return import.meta.env.VITE_NODE_ENV === 'local';
};

const isProduction = (): boolean => {
    return import.meta.env.VITE_NODE_ENV === 'production';
};

const buildSnapOrigin = (): string => {
    if (isLocal()) {
        return 'local:http://localhost:8080';
    } else if (isProduction()) {
        return 'npm:@yarulabs/coti-snap';
    } else {
        console.warn('VITE_NODE_ENV must be either "local" or "production"');
        return 'npm:@yarulabs/coti-snap';
    }
};

export const defaultSnapOrigin = buildSnapOrigin();

export { isLocal, isProduction, buildSnapOrigin };