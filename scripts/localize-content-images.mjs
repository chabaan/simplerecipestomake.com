// Downloads images that articles load from other websites (e.g. cdn.midjourney.com),
// saves optimized WebP copies in public/images/content/, and points the articles at them.
// Images keep working even if the other site removes them, and pages load faster.
//
// Run: node scripts/localize-content-images.mjs
// Writes .images-changed when at least one article was updated (used by the workflow).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ARTICLES_DIR = './src/content/articles';
const OUT_DIR = './public/images/content';
const OWN_HOSTS = ['simplerecipestomake.com', 'www.simplerecipestomake.com'];
const MAX_WIDTH = 900;
const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

fs.mkdirSync(OUT_DIR, { recursive: true });

let browser = null;
let warnings = 0;

// Plain download first; if the image host blocks it, load the image in a real browser (Playwright).
async function download(url) {
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' },
			signal: AbortSignal.timeout(20000),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return Buffer.from(await res.arrayBuffer());
	} catch (err) {
		if (warnings++ < 3) console.log(`::warning::Direct download failed (${err.message}) for ${url}, trying a browser`);
		return downloadWithBrowser(url);
	}
}

async function downloadWithBrowser(url) {
	if (!browser) {
		let playwright;
		try {
			playwright = await import('playwright');
		} catch {
			throw new Error('playwright not installed');
		}
		browser = await playwright.chromium.launch();
	}
	const page = await browser.newPage({ userAgent: UA });
	try {
		const res = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
		if (!res || !res.ok()) throw new Error(`browser HTTP ${res ? res.status() : 'no response'}`);
		return await res.body();
	} finally {
		await page.close();
	}
}

let changedFiles = 0;
let saved = 0;
let failed = 0;

for (const file of fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'))) {
	// Stop early if the image host blocks every download, instead of waiting on each image.
	if (saved === 0 && failed >= 5) {
		console.log('::warning::First 5 downloads all failed; stopping early.');
		break;
	}
	const slug = file.replace(/\.md$/, '');
	const mdPath = path.join(ARTICLES_DIR, file);
	let md = fs.readFileSync(mdPath, 'utf8');
	const imgTags = [...md.matchAll(/<img\b[^>]*\bsrc="(https?:\/\/[^"]+)"[^>]*>/g)];
	let n = 0;
	let changed = false;

	// Featured image still pointing at another website
	const featured = md.match(/^image:\s*"(https?:\/\/[^"]+)"/m);
	if (featured) {
		const outPath = path.join('./public/images', `${slug}.webp`);
		try {
			const buf = await download(featured[1]);
			await sharp(buf).resize(640, 480, { fit: 'cover' }).webp({ quality: 78 }).toFile(outPath);
			md = md.replace(featured[0], `image: "/images/${slug}.webp"`);
			changed = true;
			saved++;
			console.log(`  saved featured image for ${slug}`);
		} catch (err) {
			failed++;
			console.log(`  FAILED featured ${slug}: ${err.message}`);
		}
	}

	for (const [tag, url] of imgTags) {
		const host = new URL(url).hostname;
		if (OWN_HOSTS.includes(host)) continue;
		n++;
		const name = `${slug}-${n}.webp`;
		const outPath = path.join(OUT_DIR, name);
		try {
			if (!fs.existsSync(outPath)) {
				const buf = await download(url);
				await sharp(buf).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toFile(outPath);
			}
			const { width, height } = await sharp(outPath).metadata();
			const newTag = tag
				.replace(url, `/images/content/${name}`)
				.replace(/\s(width|height|loading|decoding)="[^"]*"/g, '')
				.replace(/<img\b/, `<img width="${width}" height="${height}" loading="lazy" decoding="async"`);
			md = md.replace(tag, newTag);
			changed = true;
			saved++;
			console.log(`  saved ${name} (${width}x${height})`);
		} catch (err) {
			failed++;
			console.log(`  FAILED ${slug}: ${url} -> ${err.message}`);
			if (failed <= 3) console.log(`::warning::Image failed for ${slug}: ${err.message}`);
		}
	}

	if (changed) {
		fs.writeFileSync(mdPath, md);
		changedFiles++;
	}
}

if (browser) await browser.close();
console.log(`\nImages saved: ${saved}, failed: ${failed}, articles updated: ${changedFiles}`);
console.log(`::notice::Images saved: ${saved}, failed: ${failed}, articles updated: ${changedFiles}`);
if (changedFiles > 0) fs.writeFileSync('.images-changed', 'true');
