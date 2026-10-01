import { siteConfig } from '../site.config';

const wordCount = (html: string) =>
	html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

/**
 * Splits an article's HTML body into several parts at top-level <h2> boundaries,
 * so every part holds real content. Short articles stay on a single page.
 */
export function splitArticle(body: string): string[] {
	const { maxParts, minWordsPerPart } = siteConfig.articleSplit;

	// Blocks start at a top-level <h2>/<h3> (at the beginning of a line),
	// so a page never breaks in the middle of a paragraph, list or recipe block.
	const blocks = body.split(/\n(?=<h[23][\s>])/).filter((s) => s.trim());
	const counts = blocks.map(wordCount);
	const total = counts.reduce((a, b) => a + b, 0);

	const parts = Math.max(1, Math.min(maxParts, Math.floor(total / minWordsPerPart), blocks.length));
	if (parts === 1) return [body];

	// Cumulative word count after each block.
	const cumulative: number[] = [];
	counts.reduce((acc, c, i) => (cumulative[i] = acc + c), 0);

	// For each cut, pick the block boundary closest to an even share of words.
	const cuts: number[] = [];
	for (let k = 1; k < parts; k++) {
		const goal = (total * k) / parts;
		const min = (cuts[cuts.length - 1] ?? -1) + 1;
		const max = blocks.length - (parts - k) - 1;
		let best = min;
		for (let i = min; i <= max; i++) {
			if (Math.abs(cumulative[i] - goal) < Math.abs(cumulative[best] - goal)) best = i;
		}
		cuts.push(best);
	}

	const result: string[] = [];
	let from = 0;
	for (const cut of [...cuts, blocks.length - 1]) {
		result.push(blocks.slice(from, cut + 1).join('\n'));
		from = cut + 1;
	}
	return result;
}

/**
 * Returns [firstHalf, secondHalf] split after a top-level paragraph near the middle,
 * so an ad can sit between paragraphs (never inside a list or recipe block).
 */
export function splitInMiddle(html: string): [string, string] {
	const lines = html.split('\n');
	const candidates = lines
		.map((l, i) => (/^<p[\s>]/.test(l) && /<\/p>\s*$/.test(l) ? i : -1))
		.filter((i) => i > 0);
	if (candidates.length < 3) return [html, ''];
	const mid = candidates[Math.floor(candidates.length / 2)];
	return [lines.slice(0, mid + 1).join('\n'), lines.slice(mid + 1).join('\n')];
}

/**
 * Splits html after top-level paragraphs at the given positions.
 * `after` = paragraph number (2 = after the 2nd paragraph), or a fraction (0.33 = a third of the way).
 * Returns the chunks in order; positions that can't be placed are skipped (empty chunk).
 */
export function splitAtParagraphs(html: string, positions: number[]): string[] {
	const lines = html.split('\n');
	const paras = lines
		.map((l, i) => (/^<p[\s>]/.test(l) && /<\/p>\s*$/.test(l) ? i : -1))
		.filter((i) => i >= 0);
	const cutLines: number[] = [];
	let last = -1;
	for (const pos of positions) {
		const idx = pos >= 1 ? pos - 1 : Math.round(paras.length * pos);
		const line = paras[idx];
		// Need at least one paragraph between two ads and content after the cut.
		if (line === undefined || line <= last || idx >= paras.length - 1 || (last >= 0 && paras.filter((p) => p > last && p <= line).length < 2)) {
			cutLines.push(-1);
			continue;
		}
		cutLines.push(line);
		last = line;
	}
	const chunks: string[] = [];
	let from = 0;
	for (const c of cutLines) {
		if (c < 0) { chunks.push(''); continue; }
		chunks.push(lines.slice(from, c + 1).join('\n'));
		from = c + 1;
	}
	chunks.push(lines.slice(from).join('\n'));
	return chunks;
}
