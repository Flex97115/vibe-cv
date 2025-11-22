// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://flex97115.github.io',
    base: import.meta.env.PROD ? '/vibe-cv' : '/',
});
