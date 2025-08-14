import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.tsx'),
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
    crypto: true,
  },
  environment: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SNAP_ENV: process.env.SNAP_ENV || 'local',
  },
  customizeWebpackConfig: (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        '__SNAP_ENV__': JSON.stringify(process.env.SNAP_ENV || 'local'),
        '__DEV__': JSON.stringify(process.env.NODE_ENV === 'development'),
      })
    );
    return config;
  },
};

export default config;
