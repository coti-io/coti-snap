import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse --short=6 HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
};

const getSnapVersion = () => {
  try {
    const snapManifestPath = resolve(__dirname, '../snap/snap.manifest.json');
    const snapManifest = JSON.parse(readFileSync(snapManifestPath, 'utf8'));
    const version = snapManifest.version;
    process.env.VITE_SNAP_VERSION = version;
    return version;
  } catch {
    return 'unknown';
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.VITE_GIT_COMMIT': JSON.stringify(getGitCommitHash()),
    'process.env.VITE_SNAP_VERSION': JSON.stringify(getSnapVersion()),
  },
  server: {
    port: 8000,
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none'; worker-src 'self'; child-src 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self';",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none'
    }
  },
  preview: {
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none'; worker-src 'self'; child-src 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self';",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none'
    }
  },
  plugins: [
    react({
      include: /.(jsx|tsx)$/,
      babel: {
        plugins: ['styled-components'],
        babelrc: false,
        configFile: false,
      },
    }),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
});
