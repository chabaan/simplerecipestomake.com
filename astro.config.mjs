// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Redirect pages (old duplicate articles, retired categories) are left out of the sitemap.
const isRedirectPage = (page) => {
	try {
		const path = new URL(page).pathname;
		const html = fs.readFileSync(`./dist${path}index.html`, 'utf8');
		return html.includes('http-equiv="refresh"');
	} catch {
		return false;
	}
};

// https://astro.build/config
export default defineConfig({
	site: 'https://simplerecipestomake.com',
	integrations: [sitemap({ filter: (page) => !isRedirectPage(page) })],
	// No "base" needed since we're using a custom domain (not a subpath)
});
