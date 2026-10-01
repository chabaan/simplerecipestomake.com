/**
 * Article bodies imported from WordPress end with a plain "fallback" copy of the recipe
 * (WP Recipe Maker). The site shows its own recipe card, so that copy is removed here.
 * When an article has no recipe data, the recipe card is built from that fallback copy.
 */

const FALLBACK_RE = /<!--WPRM Recipe[\s\S]*?<!--End WPRM Recipe-->/g;

export interface Recipe {
	title?: string;
	ingredients?: string[];
	instructions?: string[];
	equipment?: string[];
	notes?: string;
	servings?: string;
	prep_time?: string;
	cook_time?: string;
	total_time?: string;
	calories?: string;
}

/** Article body without the WordPress fallback recipe block. */
export function cleanBody(body: string): string {
	return body.replace(FALLBACK_RE, '').replace(/\n{3,}/g, '\n\n').trim();
}

const text = (html: string) =>
	html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function listItems(body: string, cls: string): string[] {
	const block = body.match(new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)</div>`));
	if (!block) return [];
	return [...block[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1])).filter(Boolean);
}

function parseFallback(body: string): Recipe | null {
	if (!body.includes('wprm-fallback-recipe')) return null;
	const name = body.match(/class="wprm-fallback-recipe-name"[^>]*>([\s\S]*?)<\/h2>/);
	const notes = body.match(/class="wprm-fallback-recipe-notes"[^>]*>([\s\S]*?)<\/div>/);
	const recipe: Recipe = {
		title: name ? text(name[1]) : undefined,
		equipment: listItems(body, 'wprm-fallback-recipe-equipment'),
		ingredients: listItems(body, 'wprm-fallback-recipe-ingredients'),
		instructions: listItems(body, 'wprm-fallback-recipe-instructions'),
		notes: notes ? text(notes[1]) : undefined,
	};
	return recipe.ingredients?.length || recipe.instructions?.length ? recipe : null;
}

/** Recipe data from the article's frontmatter, or parsed from its WordPress fallback block. */
export function getRecipe(entry: { data: { recipe?: string }; body?: string }): Recipe | null {
	if (entry.data.recipe) {
		try {
			return JSON.parse(entry.data.recipe);
		} catch {
			/* fall through to the fallback block */
		}
	}
	return parseFallback(entry.body ?? '');
}
