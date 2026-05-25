import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse --short=6 HEAD', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'dev';
  }
};

const getVersions = () => {
  try {
    const versionsPath = resolve(__dirname, 'src/config/versions.json');
    const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));
    return {
      snapVersion: versions.snapVersion,
      gitCommit: versions.gitCommit,
    };
  } catch (error) {
    try {
      const snapManifestPath = resolve(__dirname, '../snap/snap.manifest.json');
      const snapManifest = JSON.parse(readFileSync(snapManifestPath, 'utf8'));
      const gitCommit = getGitCommitHash();

      return {
        snapVersion: snapManifest.version,
        gitCommit,
      };
    } catch {
      return {
        snapVersion: 'unknown',
        gitCommit: 'dev',
      };
    }
  }
};

const gtmPlugin = () => ({
  name: 'vite-plugin-gtm',
  transformIndexHtml(html: string) {
    if (process.env.VITE_ENABLE_GTM !== 'true') {
      return html;
    }

    const gtmHeadScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NVHGTMPD');</script>
<!-- End Google Tag Manager -->`;

    const gtmBodyNoscript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NVHGTMPD"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

    html = html.replace('<head>', `<head>\n    ${gtmHeadScript}`);
    html = html.replace('<body>', `<body>\n    ${gtmBodyNoscript}`);

    return html;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
  },
  define: {
    'process.env.VITE_GIT_COMMIT': JSON.stringify(getVersions().gitCommit),
    'process.env.VITE_SNAP_VERSION': JSON.stringify(getVersions().snapVersion),
  },
  server: {
    port: 8000,
    headers: {
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none'; worker-src 'self'; child-src 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self';",
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
  preview: {
    headers: {
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none'; worker-src 'self'; child-src 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self';",
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
  plugins: [
    gtmPlugin(),
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
