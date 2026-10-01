// ============================================
// SITE CONFIGURATION
// Change these values to reuse this template for a new site/niche.
// ============================================
export const siteConfig = {
	// Basic identity
	name: "Simple Recipes to Make",
	tagline: "Easy camp meals & family camping food",
	domain: "simplerecipestomake.com",
	emoji: "🏕️",
	defaultDescription:
		"Simple camp meals, family camping food, and easy camping dinners made for the great outdoors.",

	// The cook shown as author on every article.
	// photo (homepage, ~600px wide) and avatar (round, ~192px) are optional: add them to public/images/.
	author: {
		name: "Ethan Carter",
		photo: "/images/ethan-carter-600.webp",
		photoLarge: "/images/ethan-carter.webp",
		avatar: "/images/ethan-carter-avatar.webp",
		url: "/about-simple-recipes-to-make/",
		shortBio:
			"Home cook raised in his grandmother's kitchen. Ethan shares simple, tested recipes, from campfire meals to classic American comfort food, made for real families.",
		welcome:
			"<p>I learned to cook beside my grandmother Margaret, who always said: <em>\u201cAnyone can follow a recipe. The real secret is cooking with a little heart.\u201d</em></p><p>Here I share <strong>simple, tested recipes</strong> with everyday ingredients and clear steps, whether you're cooking at home or around the campfire. Every recipe comes with a <strong>free download</strong> so you can keep it forever.</p>",
	},

	// Category fixes: articles that came in without a proper category
	defaultCategory: "Camp Meals",
	categoryOverrides: {},

	// Pagination
	articlesPerPage: 12,

	// Article splitting: long articles are split into up to `maxParts` pages
	// with a "Next" button. Each page keeps at least `minWordsPerPart` words.
	articleSplit: {
		maxParts: 3,
		minWordsPerPart: 300,
	},

	// Ads (HB Agency). Ad units only show once headCode (the <head> script) is filled in.
	ads: {
		headCode: '<script src="https://d3u598arehftfk.cloudfront.net/prebid_hb_37888_42769.js" async></script>',
		slots: {
			// simplerecipestomake_In Image (336110): under the featured image
			top: "<div id='hbagency_space_336110'></div>",
			outstream: "",
			// simplerecipestomake_In Page (336111): inside the text
			inarticle1: '<div class="hb-ad-inpage"><div class="hb-ad-inner"><div class="hbagency_cls hbagency_space_336111"></div></div></div>',
			interscroller: "",
			inarticle2: "",
			// Site-wide: Interstitial (336109) + Sticky floor 728x90 (336107) + Magic Left 300x600 (336108)
			sticky: [
				"<div id='hbagency_space_336109'></div>",
				"<div id='HB_Footer_Close_hbagency_space_336107'><div id='HB_CLOSE_hbagency_space_336107'></div><div id='HB_OUTER_hbagency_space_336107'><div id='hbagency_space_336107'></div></div></div>",
				"<div id='HB_Footer_Close_hbagency_space_336108'><div id='HB_CLOSE_hbagency_space_336108'></div><div id='HB_OUTER_hbagency_space_336108'><div id='hbagency_space_336108'></div></div></div>",
			].join(""),
		},
	},

	// Visitor stats (GoatCounter). Put your GoatCounter code here to turn it on.
	analytics: {
		goatcounterCode: "",
	},

	// Footer
	footerText: "© 2026 Simple Recipes to Make — Recipes by Ethan Carter",
};
