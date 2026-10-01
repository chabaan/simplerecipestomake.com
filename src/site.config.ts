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
		name: "Jenna Hart",
		photo: "",
		avatar: "",
		url: "/about-simple-recipes-to-make/",
		shortBio:
			"Camping mom and campfire cook. Jenna shares simple, tested camp meals that are easy to prep at home and cook outdoors with the whole family.",
		welcome:
			"<p>I'm a mom of three who spends every free weekend at a campsite. Over the years I've learned that great camp food doesn't need fancy gear, just <strong>simple, tested recipes</strong> you can prep at home and finish over the fire, on a grill or on a camp stove.</p><p>Every recipe comes with clear steps, honest timings, and a <strong>free download</strong> so you can take it on your next trip, even without signal.</p>",
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
		headCode: "",
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
	footerText: "© 2026 Simple Recipes to Make — Recipes by Jenna Hart",
};
