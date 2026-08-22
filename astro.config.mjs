// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical home is the apex of the shared umbrella domain. github.io now
  // 301s here via the repo's Pages custom domain.
  site: 'https://tn07.dev',
  output: 'static',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'always',
  },
});
