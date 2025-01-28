import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    server:{
        port:8000,
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
            svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
             include: "**/*.svg",
        }),
    ],
});