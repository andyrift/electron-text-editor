import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import vue from '@vitejs/plugin-vue'

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
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['column', 'columns', 'pagelink'].includes(tag),
          }
        }
      })
    ],
    
    clearScreen: false,
  } as UserConfig;
});
