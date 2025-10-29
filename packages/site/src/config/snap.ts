const isSnapLocal = (): boolean => {
  return import.meta.env.VITE_SNAP_ENV === 'local';
};

const DEFAULT_SNAP_ORIGIN = 'npm:@coti-io/coti-snap';
const DEFAULT_LOCAL_SNAP_URL = 'http://localhost:8080';

const buildSnapOrigin = (): string => {
  if (isSnapLocal()) {
    const localUrl =
      import.meta.env.VITE_SNAP_LOCAL_URL ?? DEFAULT_LOCAL_SNAP_URL;
    return `local:${localUrl}`;
  }

  return import.meta.env.VITE_SNAP_ORIGIN ?? DEFAULT_SNAP_ORIGIN;
};

export const defaultSnapOrigin = buildSnapOrigin();

export { buildSnapOrigin };
