import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import path from 'path';

const globalCssClassNames = /^(dark|group|os-|touch)/;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const modules: Record<string, string> = {};
  const moduleSuffix: Record<string, string> = {};

  return {
    base: env.VITE_APP_ROUTER_BASE || undefined,
    plugins: [react(), splitVendorChunkPlugin()],

    server: {
      port: Number(env.PORT || 3031),
      sourcemap: env.SOURCEMAPS === 'true',
      host: true,
    },

    build: {
      target: 'esnext',
      polyfillDynamicImport: false,
      sourcemap: env.SOURCEMAPS === 'true',
      minify: false,
    },

    publicDir: 'public',

    css: {
      modules: {
        globalModulePaths: [/tailwindcss/],
        generateScopedName(cname, filename) {
          if (globalCssClassNames.test(cname)) {
            return cname;
          }
          const key = `${filename}`;
          const savedClassName = modules[`${key}-${cname}`];
          if (savedClassName) {
            return savedClassName;
          }
          const randomStr = moduleSuffix[key] || Math.random().toString(36).slice(2, 6);
          const className = `${cname}_${randomStr}`;
          modules[`${key}-${cname}`] = className;
          moduleSuffix[key] = randomStr;
          return className;
        },
      },
    },

    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
  };
});
