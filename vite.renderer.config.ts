import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      pluginExposeRenderer(name),
      vue()
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@components": path.resolve(__dirname, './src/ui/components'),
        "@core": path.resolve(__dirname, './src/ui/core'),
        "@utils": path.resolve(__dirname, './src/ui/utils'),
      },
    },
    
    clearScreen: false,
  } as UserConfig;
});
