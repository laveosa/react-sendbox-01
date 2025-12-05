import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import vitePluginSvgr from 'vite-plugin-svgr';

const srcPath = resolve(__dirname, 'src').replace(/\\/g, '/');
const DEFAULT_PORT = 3000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseUrl = mode === 'production' ? env.VITE_APP_BASE_PATH : '/';
  const proxyTarget = env.VITE_API_URL || `http://localhost:${DEFAULT_PORT}`;

  return {
    base: baseUrl,
    publicDir: 'public',
    plugins: [
      react(),
      checker({
        typescript: true,
      }),
      vitePluginSvgr({
        include: '**/*.svg',
        exclude: /node-modules/,
      }),
    ],
    resolve: {
      alias: {
        '@': srcPath,
        '~': resolve(__dirname, './'),
      },
    },
    server: {
      port: DEFAULT_PORT,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      modules: {
        generateScopedName: '[name]__[local]--[hash:base64:5]',
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${srcPath}/styles/mixins.scss" as *;\n@use "${srcPath}/styles/variables.scss" as vars;\n`,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      minify: mode === 'production' ? 'terser' : false,
    },
  };
});
