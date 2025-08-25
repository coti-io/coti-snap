import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';
import webpack from 'webpack';

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
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    SNAP_ENV: process.env.SNAP_ENV ?? 'local',
  },
  customizeWebpackConfig: (webpackConfig) => {
    webpackConfig.plugins = webpackConfig.plugins ?? [];
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        SNAP_ENV: JSON.stringify(process.env.SNAP_ENV ?? 'local'),
        DEV: JSON.stringify(process.env.NODE_ENV === 'development'),
      })
    );
    return webpackConfig;
  },
};

export default config;
