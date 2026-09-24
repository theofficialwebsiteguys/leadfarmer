/**
 * Generates database/seed.sql from the content that currently ships in the
 * Angular build, so a fresh install of the database renders the site exactly as
 * it looked before the CMS existed.
 *
 * Strains, dispensaries, articles and the Story page rows are read from the real
 * source-of-truth data files (transpiled first) rather than re-typed, so the seed
 * cannot drift from them — and neither can the offline fallback, which reads the
 * same files. Page copy is declared below, matching the component templates.
 *
 * Run from the repository root:
 *
 *     npm run generate-seed
 *
 * (which transpiles the two data files into .seedtmp, runs this script, and
 * removes .seedtmp again).
 */

import { rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

const { STRAINS } = await import(
  new URL(`file:///${resolve(repoRoot, '.seedtmp/data/strains.data.js').replace(/\\/g, '/')}`)
);
const { DISPENSARY_REGIONS } = await import(
  new URL(`file:///${resolve(repoRoot, '.seedtmp/data/dispensaries.data.js').replace(/\\/g, '/')}`)
);
const { ARTICLES, STORY_SECTIONS, STORY_STATS } = await import(
  new URL(`file:///${resolve(repoRoot, '.seedtmp/data/site-content.data.js').replace(/\\/g, '/')}`)
);

/** SQL string literal. */
const s = (value) => {
  if (value === undefined || value === null || value === '') return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
};
/** SQL string literal that prefers '' over NULL (for NOT NULL columns). */
const sNotNull = (value) => `'${String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
const b = (value) => (value ? 1 : 0);

const lines = [];
const out = (line = '') => lines.push(line);

out('-- ============================================================================');
out('-- Lead Farmer — initial content seed');
out('--');
out('-- GENERATED FILE — do not edit by hand.');
out('-- Regenerate with api/database/generate-seed.mjs (see the header of that file).');
out('--');
out('-- Reproduces the exact content the site shipped with, so a fresh database');
out('-- produces a pixel-identical public site. Safe to re-run: every statement is');
out('-- INSERT ... ON DUPLICATE KEY UPDATE or guarded by a delete of seeded rows.');
out('--');
out('-- Apply after schema.sql:  mysql -u USER -p DBNAME < seed.sql');
out('-- ============================================================================');
out('');
out('SET NAMES utf8mb4;');
out('');

// ---------------------------------------------------------------------------
// Page content blocks
// ---------------------------------------------------------------------------

/**
 * key, value, fieldType, section, groupLabel, fieldLabel, helpText, altText
 * Keys are descriptive (homepage.heroTagline), never positional (title1).
 */
const contentBlocks = [
  // ---- Home: hero -------------------------------------------------------
  ['homepage.heroWordmarkImage', 'assets/brand/brand-lettering-white.png', 'image', 'homepage', 'Hero', 'Logo image over the video', 'The large Lead Farmer lettering shown on top of the hero video.', 'Lead Farmer'],
  ['homepage.heroTagline', 'Grown with precision, care, and deep respect for the craft.\nEvery plant tells a story of quality and dedication.', 'textarea', 'homepage', 'Hero', 'Tagline under the logo', 'Two short lines. Press Enter between them to create the line break.', ''],
  ['homepage.heroScrollLabel', 'Scroll', 'text', 'homepage', 'Hero', 'Scroll prompt', 'The small word above the buttons.', ''],
  ['homepage.heroPrimaryButtonLabel', 'View Strains', 'text', 'homepage', 'Hero', 'Main button text', '', ''],
  ['homepage.heroPrimaryButtonLink', '/strains', 'url', 'homepage', 'Hero', 'Main button link', 'A page on this site (like /strains) or a full web address.', ''],
  ['homepage.heroSecondaryButtonLabel', 'Shop Merch', 'text', 'homepage', 'Hero', 'Second button text', '', ''],
  ['homepage.heroSecondaryButtonLink', '/merch', 'url', 'homepage', 'Hero', 'Second button link', '', ''],

  // ---- Home: story teaser ------------------------------------------------
  ['homepage.storyEyebrow', 'The Craft', 'text', 'homepage', 'Story section', 'Small label above the heading', '', ''],
  ['homepage.storyHeading', 'Every Plant.\nEvery Room.\nEvery Harvest.', 'textarea', 'homepage', 'Story section', 'Heading', 'Press Enter where you want each line to break.', ''],
  ['homepage.storyBody', 'We cultivate cannabis the way it should be grown — deliberately, and with care. From the moment a clone is set to the final cure, every decision is made with the plant and the customer in mind. Our grow rooms in the Southern Tier are built for precision, consistency, and quality without compromise.', 'textarea', 'homepage', 'Story section', 'Paragraph', '', ''],
  ['homepage.storyLocation', 'Southern Tier, New York', 'text', 'homepage', 'Story section', 'Location line', '', ''],
  ['homepage.storyLinkLabel', 'Read Our Full Story', 'text', 'homepage', 'Story section', 'Link text to the Story page', '', ''],
  ['homepage.storyImage', 'assets/brand/brand-full.png', 'image', 'homepage', 'Story section', 'Image beside the text', '', ''],

  // ---- Home: strains -----------------------------------------------------
  ['homepage.strainsEyebrow', 'Our Strains', 'text', 'homepage', 'Strains section', 'Small label above the heading', '', ''],
  ['homepage.strainsHeading', 'What We Grow', 'text', 'homepage', 'Strains section', 'Heading', '', ''],
  ['homepage.strainsButtonLabel', 'Browse All Strains', 'text', 'homepage', 'Strains section', 'Button text', '', ''],

  // ---- Home: gallery -----------------------------------------------------
  ['homepage.galleryEyebrow', 'Products', 'text', 'homepage', 'Gallery section', 'Small label above the heading', '', ''],
  ['homepage.galleryHeading', 'Gallery', 'text', 'homepage', 'Gallery section', 'Heading', '', ''],

  // ---- Home: articles ----------------------------------------------------
  ['homepage.articlesEyebrow', 'Field Notes', 'text', 'homepage', 'Articles section', 'Small label above the heading', '', ''],
  ['homepage.articlesHeading', 'Latest Articles', 'text', 'homepage', 'Articles section', 'Heading', '', ''],

  // ---- Home: contact -----------------------------------------------------
  ['homepage.contactHeading', 'Get In Touch', 'text', 'homepage', 'Contact section', 'Heading', '', ''],
  ['homepage.contactEmail', 'info@leadfarmer.com', 'text', 'settings', 'Contact details', 'Email address', 'Shown at the bottom of the home page, and used by the wholesale enquiry button on every strain.', ''],
  ['homepage.contactAddress', 'Southern Tier, New York', 'text', 'settings', 'Contact details', 'Location line', 'The line under the email address.', ''],
  ['homepage.contactMarkImage', 'assets/brand/brand-head.png', 'image', 'homepage', 'Contact section', 'Logo mark above the heading', '', ''],

  // ---- Story page --------------------------------------------------------
  ['story.heroImage', 'assets/product/Zoap/zoap-flower.jpg', 'image', 'story', 'Hero', 'Background photo', 'Large photo behind the page heading.', ''],
  ['story.heroEyebrow', 'The Craft', 'text', 'story', 'Hero', 'Small label above the heading', '', ''],
  ['story.heroHeading', 'Every Plant.\nEvery Room.\nEvery Harvest.', 'textarea', 'story', 'Hero', 'Page heading', 'Press Enter where you want each line to break.', ''],
  ['story.heroTagline', 'Grown with precision, care, and deep respect for the craft — this is how we approach every batch, from the moment a clone is set to the final cure.', 'textarea', 'story', 'Hero', 'Paragraph under the heading', '', ''],

  ['story.directoryEyebrow', 'Where To Find Us', 'text', 'story', 'Dispensary directory', 'Small label above the heading', '', ''],
  ['story.directoryHeading', 'Our Retail Partners', 'text', 'story', 'Dispensary directory', 'Heading', '', ''],
  ['story.directoryIntro', 'Lead Farmer is currently stocked at {count} dispensaries across New York State — find one near you below.', 'textarea', 'story', 'Dispensary directory', 'Intro paragraph', 'Write {count} where you want the current number of dispensaries to appear automatically.', ''],

  ['story.ctaHeading', 'Taste The Difference', 'text', 'story', 'Closing call to action', 'Heading', '', ''],
  ['story.ctaBody', "See what's currently in rotation and find your next favorite.", 'textarea', 'story', 'Closing call to action', 'Paragraph', '', ''],
  ['story.ctaPrimaryButtonLabel', 'Browse All Strains', 'text', 'story', 'Closing call to action', 'Main button text', '', ''],
  ['story.ctaPrimaryButtonLink', '/strains', 'url', 'story', 'Closing call to action', 'Main button link', '', ''],
  ['story.ctaSecondaryButtonLabel', 'Get In Touch', 'text', 'story', 'Closing call to action', 'Second button text', '', ''],

  // ---- Strains catalog page ---------------------------------------------
  ['strains.pageEyebrow', 'The Full Menu', 'text', 'strains', 'Catalog page', 'Small label above the heading', '', ''],
  ['strains.pageHeading', 'Strains', 'text', 'strains', 'Catalog page', 'Page heading', '', ''],
  ['strains.pageIntro', 'Browse every strain currently in rotation. Filter by type or format, or search by name.', 'textarea', 'strains', 'Catalog page', 'Intro paragraph', '', ''],
  ['strains.detailWholesaleButtonLabel', 'Wholesale Inquiry', 'text', 'strains', 'Strain detail page', 'Wholesale button text', 'Appears on every individual strain page.', ''],

  // ---- Merch page --------------------------------------------------------
  ['merch.pageEyebrow', 'Wear The Brand', 'text', 'merch', 'Merch page', 'Small label above the heading', '', ''],
  ['merch.pageHeading', 'Merch', 'text', 'merch', 'Merch page', 'Page heading', '', ''],
  ['merch.pageIntro', 'Hats, tees, and more — our full merch lineup lives on our online store. Head over there to shop.', 'textarea', 'merch', 'Merch page', 'Intro paragraph', '', ''],
  ['merch.storeButtonLabel', 'Shop Merch', 'text', 'merch', 'Merch page', 'Button text', '', ''],
  ['merch.storeUrl', '#', 'url', 'settings', 'Merch', 'Link to your online store', 'Where the “Shop Merch” button sends people. Paste the full web address.', ''],

  // ---- Age gate ----------------------------------------------------------
  ['ageGate.eyebrow', 'Age Verification', 'text', 'ageGate', 'Age check pop-up', 'Small label above the heading', '', ''],
  ['ageGate.heading', 'Are You 21 or Older?', 'text', 'ageGate', 'Age check pop-up', 'Question', '', ''],
  ['ageGate.body', 'This site features cannabis products intended for adults 21 years of age and older. Please confirm your age to continue.', 'textarea', 'ageGate', 'Age check pop-up', 'Explanation', '', ''],
  ['ageGate.confirmButtonLabel', "Yes, I'm 21+", 'text', 'ageGate', 'Age check pop-up', 'Yes button text', '', ''],
  ['ageGate.denyButtonLabel', "No, I'm Not", 'text', 'ageGate', 'Age check pop-up', 'No button text', '', ''],
  ['ageGate.deniedHeading', 'Access Restricted', 'text', 'ageGate', 'If they answer no', 'Heading', '', ''],
  ['ageGate.deniedBody', 'You must be 21 years of age or older to view this site.', 'textarea', 'ageGate', 'If they answer no', 'Message', '', ''],
  ['ageGate.deniedButtonLabel', 'Leave Site', 'text', 'ageGate', 'If they answer no', 'Button text', '', ''],
  ['ageGate.deniedButtonLink', 'https://www.google.com', 'url', 'ageGate', 'If they answer no', 'Where the button sends them', '', ''],
  ['ageGate.logoImage', 'assets/brand/brand-head.png', 'image', 'ageGate', 'Age check pop-up', 'Logo image', '', 'Lead Farmer'],

  // ---- Navigation --------------------------------------------------------
  ['nav.storyLabel', 'Story', 'text', 'navigation', 'Menu labels', 'Story link', '', ''],
  ['nav.strainsLabel', 'Strains', 'text', 'navigation', 'Menu labels', 'Strains link', '', ''],
  ['nav.galleryLabel', 'Gallery', 'text', 'navigation', 'Menu labels', 'Gallery link', '', ''],
  ['nav.articlesLabel', 'Articles', 'text', 'navigation', 'Menu labels', 'Articles link', '', ''],
  ['nav.merchLabel', 'Merch', 'text', 'navigation', 'Menu labels', 'Merch link', '', ''],
  ['nav.contactLabel', 'Contact', 'text', 'navigation', 'Menu labels', 'Contact link', '', ''],
  ['nav.logoImage', 'assets/brand/brand-head.png', 'image', 'navigation', 'Menu labels', 'Logo in the menu bar', '', 'Lead Farmer'],

  // ---- Footer ------------------------------------------------------------
  ['footer.warningText', 'For use only by adults 21 years of age and older. Keep out of reach of children and pets. In case of accidental ingestion or overconsumption, contact the Poison Center at 1-800-222-1222 or call 9-1-1. Please consume responsibly. Cannabis can be addictive. Concerned? Contact the NY State HOPELine — text "HopeNY," call 1-877-8-HOPENY, or visit', 'textarea', 'footer', 'Legal warning', 'Required warning text', 'New York OCM requires this notice in the yellow box. Check with your compliance contact before changing it.', ''],
  ['footer.warningLinkLabel', 'oasas.ny.gov/HOPELine', 'text', 'footer', 'Legal warning', 'Link text at the end of the warning', '', ''],
  ['footer.warningLinkUrl', 'https://oasas.ny.gov/HOPELine', 'url', 'footer', 'Legal warning', 'Where that link goes', '', ''],
  ['footer.copyrightSuffix', 'Lead Farmer. Premium Cannabis Cultivation.', 'text', 'footer', 'Copyright', 'Text after the year', 'The year is added automatically.', ''],

  // ---- Site-wide SEO -----------------------------------------------------
  ['seo.homeTitle', 'Lead Farmer — Southern Tier Cannabis Cultivation', 'text', 'seo', 'Search engines', 'Home page browser title', '', ''],
  ['seo.homeDescription', "Lead Farmer grows premium cannabis in New York's Southern Tier with precision, craft, and care from clone to cure.", 'textarea', 'seo', 'Search engines', 'Home page description', 'Shown in Google results. Around 150 characters works best.', ''],
  ['seo.storyTitle', 'Our Story — Lead Farmer', 'text', 'seo', 'Search engines', 'Story page browser title', '', ''],
  ['seo.storyDescription', 'The story behind Lead Farmer — Southern Tier cannabis cultivation grown with precision and care, plus where to find it across New York.', 'textarea', 'seo', 'Search engines', 'Story page description', '', ''],
  ['seo.strainsTitle', 'Strains — Lead Farmer', 'text', 'seo', 'Search engines', 'Strains page browser title', '', ''],
  ['seo.strainsDescription', 'Browse every Lead Farmer strain currently in rotation — filter by type or format, or search by name.', 'textarea', 'seo', 'Search engines', 'Strains page description', '', ''],
  ['seo.merchTitle', 'Merch — Lead Farmer', 'text', 'seo', 'Search engines', 'Merch page browser title', '', ''],
  ['seo.merchDescription', 'Lead Farmer branded merch — shop hats, tees, and more on our online store.', 'textarea', 'seo', 'Search engines', 'Merch page description', '', ''],
];

out('-- ---------------------------------------------------------------------------');
out('-- Page content');
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO content_blocks');
out('  (content_key, content_value, alt_text, field_type, section, group_label, field_label, help_text, sort_order)');
out('VALUES');

const contentValues = contentBlocks.map(
  ([key, value, fieldType, section, groupLabel, fieldLabel, helpText, altText], index) =>
    `  (${s(key)}, ${s(value)}, ${s(altText)}, ${s(fieldType)}, ${s(section)}, ${sNotNull(groupLabel)}, ${sNotNull(fieldLabel)}, ${s(helpText)}, ${index})`
);
out(contentValues.join(',\n') + ';');
out('');
out('-- Note: re-running this file will fail on the unique key rather than silently');
out('-- overwriting edits the client has made. To intentionally reset page copy,');
out('-- delete the rows first:  DELETE FROM content_blocks;');
out('');

// ---------------------------------------------------------------------------
// Strains
// ---------------------------------------------------------------------------

out('-- ---------------------------------------------------------------------------');
out(`-- Strains (${STRAINS.length}) — generated from src/app/data/strains.data.ts`);
out('-- ---------------------------------------------------------------------------');
out('');

STRAINS.forEach((strain, index) => {
  out(`-- ${strain.name}`);
  out('INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)');
  out('VALUES');
  out(
    `  (${strain.id}, ${s(strain.slug)}, ${s(strain.name)}, ${s(strain.shortDescription)}, ` +
      `${b(strain.featured)}, ${s(strain.releaseDate)}, ${index}, 1);`
  );
  out('');

  const imageRows = [];
  if (strain.mainImage) {
    imageRows.push(['main', strain.mainImage, 0]);
  }
  (strain.galleryImages ?? []).forEach((image, i) => imageRows.push(['gallery', image, i]));
  (strain.packagingImages ?? []).forEach((image, i) => imageRows.push(['packaging', image, i]));

  for (const [kind, image, sort] of imageRows) {
    out(
      `INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) ` +
        `VALUES (${strain.id}, '${kind}', ${s(image.src)}, ${sNotNull(image.alt)}, ${s(image.label)}, ${sort});`
    );
  }
  out('');
});

// Keep AUTO_INCREMENT clear of the explicit ids above.
const maxStrainId = Math.max(...STRAINS.map((s_) => s_.id));
out(`ALTER TABLE strains AUTO_INCREMENT = ${maxStrainId + 1};`);
out('');

// ---------------------------------------------------------------------------
// Dispensaries
// ---------------------------------------------------------------------------

const dispensaryCount = DISPENSARY_REGIONS.reduce((sum, r) => sum + r.dispensaries.length, 0);

out('-- ---------------------------------------------------------------------------');
out(`-- Dispensaries (${dispensaryCount}) — generated from src/app/data/dispensaries.data.ts`);
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO dispensaries (name, location, region, website_url, is_published)');
out('VALUES');

// No ordering columns: the API sorts regions and shops alphabetically.
const dispensaryValues = [];
DISPENSARY_REGIONS.forEach((group) => {
  group.dispensaries.forEach((dispensary) => {
    dispensaryValues.push(
      `  (${s(dispensary.name)}, ${s(dispensary.location)}, ${s(group.region)}, ${s(dispensary.url)}, 1)`
    );
  });
});
out(dispensaryValues.join(',\n') + ';');
out('');

// ---------------------------------------------------------------------------
// Articles — from src/app/data/site-content.data.ts
// ---------------------------------------------------------------------------

out('-- ---------------------------------------------------------------------------');
out(`-- Articles (${ARTICLES.length}) — generated from src/app/data/site-content.data.ts`);
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO articles (slug, title, excerpt, published_on, image_src, image_alt, external_url, sort_order, is_published)');
out('VALUES');
out(
  ARTICLES.map(
    (article, index) =>
      `  (${s(article.slug)}, ${s(article.title)}, ${s(article.excerpt)}, ${s(article.publishedOn)}, ` +
      `${s(article.imageSrc)}, ${s(article.imageAlt)}, ${s(article.externalUrl)}, ${index}, ${b(article.isPublished)})`
  ).join(',\n') + ';'
);
out('');

// ---------------------------------------------------------------------------
// Home page gallery
//
// Derived from the strain photos, reproducing exactly what the gallery showed
// when it was assembled automatically: every photo of every strain, in strain
// order, with the first photo of each strain carrying the strain's name as its
// caption. From here on the client curates it in the dashboard.
// ---------------------------------------------------------------------------

const galleryRows = [];
for (const strain of STRAINS) {
  const photos = [strain.mainImage, ...(strain.galleryImages ?? []), ...(strain.packagingImages ?? [])];
  photos.forEach((photo, index) => {
    galleryRows.push({
      src: photo.src,
      alt: photo.alt,
      // Only the first photo of each strain was labelled in the old carousel.
      caption: index === 0 ? strain.name : '',
    });
  });
}

out('-- ---------------------------------------------------------------------------');
out(`-- Home page gallery (${galleryRows.length}) — derived from the strain photos`);
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO gallery_images (image_src, image_alt, caption, sort_order, is_published)');
out('VALUES');
out(
  galleryRows
    .map((row, index) => `  (${s(row.src)}, ${sNotNull(row.alt)}, ${s(row.caption)}, ${index}, 1)`)
    .join(',\n') + ';'
);
out('');

// ---------------------------------------------------------------------------
// Story page repeatables — from src/app/data/site-content.data.ts
// ---------------------------------------------------------------------------

out('-- ---------------------------------------------------------------------------');
out(`-- Story page — image/text rows (${STORY_SECTIONS.length})`);
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO story_sections (eyebrow, heading, body, image_src, image_alt, sort_order, is_published)');
out('VALUES');
out(
  STORY_SECTIONS.map(
    (section, index) =>
      `  (${sNotNull(section.eyebrow)}, ${s(section.heading)}, ${s(section.body)}, ` +
      `${s(section.imageSrc)}, ${s(section.imageAlt)}, ${index}, ${b(section.isPublished)})`
  ).join(',\n') + ';'
);
out('');

out('-- ---------------------------------------------------------------------------');
out(`-- Story page — statistics band (${STORY_STATS.length})`);
out('-- ---------------------------------------------------------------------------');
out('');
out('INSERT INTO story_stats (value, label, auto_source, is_text_style, sort_order, is_published)');
out('VALUES');
out(
  STORY_STATS.map(
    (stat, index) =>
      `  (${sNotNull(stat.value)}, ${s(stat.label)}, ${s(stat.autoSource)}, ` +
      `${b(stat.isTextStyle)}, ${index}, ${b(stat.isPublished)})`
  ).join(',\n') + ';'
);
out('');

const target = resolve(here, 'seed.sql');
writeFileSync(target, lines.join('\n'), 'utf8');

// Clean up the transpiled intermediates the npm script created.
rmSync(resolve(repoRoot, '.seedtmp'), { recursive: true, force: true });

console.log(`Wrote ${target}`);
console.log(`  content blocks : ${contentBlocks.length}`);
console.log(`  strains        : ${STRAINS.length}`);
console.log(`  dispensaries   : ${dispensaryCount}`);
console.log(`  gallery images : ${galleryRows.length}`);
console.log(`  articles       : ${ARTICLES.length}`);
console.log(`  story sections : ${STORY_SECTIONS.length}`);
console.log(`  story stats    : ${STORY_STATS.length}`);
