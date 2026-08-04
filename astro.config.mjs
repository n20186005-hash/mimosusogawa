import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL?.trim();

export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
