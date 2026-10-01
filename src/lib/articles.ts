import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../site.config';

type Article = CollectionEntry<'articles'>;

const decode = (s: string) =>
	s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();

export const catSlug = (cat: string) =>
	cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Category shown on the site: decoded, with per-article overrides for uncategorized posts. */
export function normalizeCategory(id: string, raw?: string): string {
	const override = (siteConfig.categoryOverrides as Record<string, string>)[id];
	if (override) return override;
	const cat = decode(raw ?? '');
	if (!cat || cat.toLowerCase() === 'uncategorized') return siteConfig.defaultCategory;
	return cat;
}

const byDateDesc = (a: Article, b: Article) => {
	const da = a.data.pubDate ? new Date(a.data.pubDate).getTime() : 0;
	const db = b.data.pubDate ? new Date(b.data.pubDate).getTime() : 0;
	return db - da;
};

/**
 * Finds articles that repeat another article's title (e.g. "slug-2" copies).
 * Returns a map of duplicateId -> the id that is kept.
 */
async function findDuplicates(all: Article[]): Promise<Map<string, string>> {
	const byTitle = new Map<string, Article[]>();
	for (const a of all) {
		const key = decode(a.data.title).toLowerCase();
		byTitle.set(key, [...(byTitle.get(key) ?? []), a]);
	}
	const dupes = new Map<string, string>();
	for (const group of byTitle.values()) {
		if (group.length < 2) continue;
		// Keep the shortest slug (the original, without "-2"), oldest first on ties.
		const keep = [...group].sort((a, b) => a.id.length - b.id.length || -byDateDesc(a, b))[0];
		for (const a of group) if (a.id !== keep.id) dupes.set(a.id, keep.id);
	}
	return dupes;
}

let cache: { articles: Article[]; redirects: Map<string, string> } | null = null;

async function load() {
	if (cache) return cache;
	const all = await getCollection('articles');
	const redirects = await findDuplicates(all);
	const articles = all
		.filter((a) => !redirects.has(a.id))
		.map((a) => ({
			...a,
			data: {
				...a.data,
				title: decode(a.data.title),
				category: normalizeCategory(a.id, a.data.category),
				author: siteConfig.author.name,
			},
		}))
		.sort(byDateDesc) as Article[];
	cache = { articles, redirects };
	return cache;
}

/** All published articles: duplicates removed, categories cleaned, newest first. */
export async function getArticles(): Promise<Article[]> {
	return (await load()).articles;
}

/** Old URLs that should send visitors to another page (duplicate articles, retired categories). */
export async function getRedirects(): Promise<Map<string, string>> {
	const { articles, redirects } = await load();
	const map = new Map<string, string>();
	for (const [from, to] of redirects) map.set(`${from}`, `/${to}/`);
	const liveCats = new Set(articles.map((a) => catSlug(a.data.category!)));
	const all = await getCollection('articles');
	for (const a of all) {
		const oldSlug = catSlug(a.data.category ?? '');
		if (oldSlug && !liveCats.has(oldSlug)) {
			const target = normalizeCategory(a.id, a.data.category);
			map.set(`category/${oldSlug}`, `/category/${catSlug(target)}/`);
		}
	}
	return map;
}
