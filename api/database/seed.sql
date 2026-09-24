-- ============================================================================
-- Lead Farmer — initial content seed
--
-- GENERATED FILE — do not edit by hand.
-- Regenerate with api/database/generate-seed.mjs (see the header of that file).
--
-- Reproduces the exact content the site shipped with, so a fresh database
-- produces a pixel-identical public site. Safe to re-run: every statement is
-- INSERT ... ON DUPLICATE KEY UPDATE or guarded by a delete of seeded rows.
--
-- Apply after schema.sql:  mysql -u USER -p DBNAME < seed.sql
-- ============================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Page content
-- ---------------------------------------------------------------------------

INSERT INTO content_blocks
  (content_key, content_value, alt_text, field_type, section, group_label, field_label, help_text, sort_order)
VALUES
  ('homepage.heroWordmarkImage', 'assets/brand/brand-lettering-white.png', 'Lead Farmer', 'image', 'homepage', 'Hero', 'Logo image over the video', 'The large Lead Farmer lettering shown on top of the hero video.', 0),
  ('homepage.heroTagline', 'Grown with precision, care, and deep respect for the craft.
Every plant tells a story of quality and dedication.', NULL, 'textarea', 'homepage', 'Hero', 'Tagline under the logo', 'Two short lines. Press Enter between them to create the line break.', 1),
  ('homepage.heroScrollLabel', 'Scroll', NULL, 'text', 'homepage', 'Hero', 'Scroll prompt', 'The small word above the buttons.', 2),
  ('homepage.heroPrimaryButtonLabel', 'View Strains', NULL, 'text', 'homepage', 'Hero', 'Main button text', NULL, 3),
  ('homepage.heroPrimaryButtonLink', '/strains', NULL, 'url', 'homepage', 'Hero', 'Main button link', 'A page on this site (like /strains) or a full web address.', 4),
  ('homepage.heroSecondaryButtonLabel', 'Read Articles', NULL, 'text', 'homepage', 'Hero', 'Second button text', NULL, 5),
  ('homepage.heroSecondaryButtonLink', '#articles', NULL, 'url', 'homepage', 'Hero', 'Second button link', NULL, 6),
  ('homepage.storyEyebrow', 'The Craft', NULL, 'text', 'homepage', 'Story section', 'Small label above the heading', NULL, 7),
  ('homepage.storyHeading', 'Every Plant.
Every Room.
Every Harvest.', NULL, 'textarea', 'homepage', 'Story section', 'Heading', 'Press Enter where you want each line to break.', 8),
  ('homepage.storyBody', 'We cultivate cannabis the way it should be grown — deliberately, and with care. From the moment a clone is set to the final cure, every decision is made with the plant and the customer in mind. Our grow rooms in the Southern Tier are built for precision, consistency, and quality without compromise.', NULL, 'textarea', 'homepage', 'Story section', 'Paragraph', NULL, 9),
  ('homepage.storyLocation', 'Southern Tier, New York', NULL, 'text', 'homepage', 'Story section', 'Location line', NULL, 10),
  ('homepage.storyLinkLabel', 'Read Our Full Story', NULL, 'text', 'homepage', 'Story section', 'Link text to the Story page', NULL, 11),
  ('homepage.storyImage', 'assets/brand/brand-full.png', NULL, 'image', 'homepage', 'Story section', 'Image beside the text', NULL, 12),
  ('homepage.strainsEyebrow', 'Our Strains', NULL, 'text', 'homepage', 'Strains section', 'Small label above the heading', NULL, 13),
  ('homepage.strainsHeading', 'What We Grow', NULL, 'text', 'homepage', 'Strains section', 'Heading', NULL, 14),
  ('homepage.strainsButtonLabel', 'Browse All Strains', NULL, 'text', 'homepage', 'Strains section', 'Button text', NULL, 15),
  ('homepage.galleryEyebrow', 'Products', NULL, 'text', 'homepage', 'Gallery section', 'Small label above the heading', NULL, 16),
  ('homepage.galleryHeading', 'Gallery', NULL, 'text', 'homepage', 'Gallery section', 'Heading', NULL, 17),
  ('homepage.articlesEyebrow', 'Field Notes', NULL, 'text', 'homepage', 'Articles section', 'Small label above the heading', NULL, 18),
  ('homepage.articlesHeading', 'Latest Articles', NULL, 'text', 'homepage', 'Articles section', 'Heading', NULL, 19),
  ('homepage.contactHeading', 'Get In Touch', NULL, 'text', 'homepage', 'Contact section', 'Heading', NULL, 20),
  ('homepage.contactEmail', 'info@leadfarmer.com', NULL, 'text', 'settings', 'Contact details', 'Email address', 'Shown at the bottom of the home page, and used by the wholesale enquiry button on every strain.', 21),
  ('homepage.contactAddress', 'Southern Tier, New York', NULL, 'text', 'settings', 'Contact details', 'Location line', 'The line under the email address.', 22),
  ('homepage.contactMarkImage', 'assets/brand/brand-head.png', NULL, 'image', 'homepage', 'Contact section', 'Logo mark above the heading', NULL, 23),
  ('story.heroImage', 'assets/product/Zoap/zoap-flower.jpg', NULL, 'image', 'story', 'Hero', 'Background photo', 'Large photo behind the page heading.', 24),
  ('story.heroEyebrow', 'The Craft', NULL, 'text', 'story', 'Hero', 'Small label above the heading', NULL, 25),
  ('story.heroHeading', 'Every Plant.
Every Room.
Every Harvest.', NULL, 'textarea', 'story', 'Hero', 'Page heading', 'Press Enter where you want each line to break.', 26),
  ('story.heroTagline', 'Grown with precision, care, and deep respect for the craft — this is how we approach every batch, from the moment a clone is set to the final cure.', NULL, 'textarea', 'story', 'Hero', 'Paragraph under the heading', NULL, 27),
  ('story.directoryEyebrow', 'Where To Find Us', NULL, 'text', 'story', 'Dispensary directory', 'Small label above the heading', NULL, 28),
  ('story.directoryHeading', 'Our Retail Partners', NULL, 'text', 'story', 'Dispensary directory', 'Heading', NULL, 29),
  ('story.directoryIntro', 'Lead Farmer is currently stocked at {count} dispensaries across New York State — find one near you below.', NULL, 'textarea', 'story', 'Dispensary directory', 'Intro paragraph', 'Write {count} where you want the current number of dispensaries to appear automatically.', 30),
  ('story.ctaHeading', 'Taste The Difference', NULL, 'text', 'story', 'Closing call to action', 'Heading', NULL, 31),
  ('story.ctaBody', 'See what''s currently in rotation and find your next favorite.', NULL, 'textarea', 'story', 'Closing call to action', 'Paragraph', NULL, 32),
  ('story.ctaPrimaryButtonLabel', 'Browse All Strains', NULL, 'text', 'story', 'Closing call to action', 'Main button text', NULL, 33),
  ('story.ctaPrimaryButtonLink', '/strains', NULL, 'url', 'story', 'Closing call to action', 'Main button link', NULL, 34),
  ('story.ctaSecondaryButtonLabel', 'Get In Touch', NULL, 'text', 'story', 'Closing call to action', 'Second button text', NULL, 35),
  ('strains.pageEyebrow', 'The Full Menu', NULL, 'text', 'strains', 'Catalog page', 'Small label above the heading', NULL, 36),
  ('strains.pageHeading', 'Strains', NULL, 'text', 'strains', 'Catalog page', 'Page heading', NULL, 37),
  ('strains.pageIntro', 'Browse every strain currently in rotation. Filter by type or format, or search by name.', NULL, 'textarea', 'strains', 'Catalog page', 'Intro paragraph', NULL, 38),
  ('strains.detailWholesaleButtonLabel', 'Wholesale Inquiry', NULL, 'text', 'strains', 'Strain detail page', 'Wholesale button text', 'Appears on every individual strain page.', 39),
  ('merch.pageEyebrow', 'Wear The Brand', NULL, 'text', 'merch', 'Merch page', 'Small label above the heading', NULL, 40),
  ('merch.pageHeading', 'Merch', NULL, 'text', 'merch', 'Merch page', 'Page heading', NULL, 41),
  ('merch.pageIntro', 'Hats, tees, and more — our full merch lineup lives on our online store. Head over there to shop.', NULL, 'textarea', 'merch', 'Merch page', 'Intro paragraph', NULL, 42),
  ('merch.storeButtonLabel', 'Shop Merch', NULL, 'text', 'merch', 'Merch page', 'Button text', NULL, 43),
  ('merch.storeUrl', '#', NULL, 'url', 'settings', 'Merch', 'Link to your online store', 'Where the “Shop Merch” button sends people. Paste the full web address.', 44),
  ('ageGate.eyebrow', 'Age Verification', NULL, 'text', 'ageGate', 'Age check pop-up', 'Small label above the heading', NULL, 45),
  ('ageGate.heading', 'Are You 21 or Older?', NULL, 'text', 'ageGate', 'Age check pop-up', 'Question', NULL, 46),
  ('ageGate.body', 'This site features cannabis products intended for adults 21 years of age and older. Please confirm your age to continue.', NULL, 'textarea', 'ageGate', 'Age check pop-up', 'Explanation', NULL, 47),
  ('ageGate.confirmButtonLabel', 'Yes, I''m 21+', NULL, 'text', 'ageGate', 'Age check pop-up', 'Yes button text', NULL, 48),
  ('ageGate.denyButtonLabel', 'No, I''m Not', NULL, 'text', 'ageGate', 'Age check pop-up', 'No button text', NULL, 49),
  ('ageGate.deniedHeading', 'Access Restricted', NULL, 'text', 'ageGate', 'If they answer no', 'Heading', NULL, 50),
  ('ageGate.deniedBody', 'You must be 21 years of age or older to view this site.', NULL, 'textarea', 'ageGate', 'If they answer no', 'Message', NULL, 51),
  ('ageGate.deniedButtonLabel', 'Leave Site', NULL, 'text', 'ageGate', 'If they answer no', 'Button text', NULL, 52),
  ('ageGate.deniedButtonLink', 'https://www.google.com', NULL, 'url', 'ageGate', 'If they answer no', 'Where the button sends them', NULL, 53),
  ('ageGate.logoImage', 'assets/brand/brand-head.png', 'Lead Farmer', 'image', 'ageGate', 'Age check pop-up', 'Logo image', NULL, 54),
  ('nav.storyLabel', 'Story', NULL, 'text', 'navigation', 'Menu labels', 'Story link', NULL, 55),
  ('nav.strainsLabel', 'Strains', NULL, 'text', 'navigation', 'Menu labels', 'Strains link', NULL, 56),
  ('nav.galleryLabel', 'Gallery', NULL, 'text', 'navigation', 'Menu labels', 'Gallery link', NULL, 57),
  ('nav.articlesLabel', 'Articles', NULL, 'text', 'navigation', 'Menu labels', 'Articles link', NULL, 58),
  ('nav.merchLabel', 'Merch', NULL, 'text', 'navigation', 'Menu labels', 'Merch link', NULL, 59),
  ('nav.contactLabel', 'Contact', NULL, 'text', 'navigation', 'Menu labels', 'Contact link', NULL, 60),
  ('nav.logoImage', 'assets/brand/brand-head.png', 'Lead Farmer', 'image', 'navigation', 'Menu labels', 'Logo in the menu bar', NULL, 61),
  ('footer.warningText', 'For use only by adults 21 years of age and older. Keep out of reach of children and pets. In case of accidental ingestion or overconsumption, contact the Poison Center at 1-800-222-1222 or call 9-1-1. Please consume responsibly. Cannabis can be addictive. Concerned? Contact the NY State HOPELine — text "HopeNY," call 1-877-8-HOPENY, or visit', NULL, 'textarea', 'footer', 'Legal warning', 'Required warning text', 'New York OCM requires this notice in the yellow box. Check with your compliance contact before changing it.', 62),
  ('footer.warningLinkLabel', 'oasas.ny.gov/HOPELine', NULL, 'text', 'footer', 'Legal warning', 'Link text at the end of the warning', NULL, 63),
  ('footer.warningLinkUrl', 'https://oasas.ny.gov/HOPELine', NULL, 'url', 'footer', 'Legal warning', 'Where that link goes', NULL, 64),
  ('footer.copyrightSuffix', 'Lead Farmer. Premium Cannabis Cultivation.', NULL, 'text', 'footer', 'Copyright', 'Text after the year', 'The year is added automatically.', 65),
  ('seo.homeTitle', 'Lead Farmer — Southern Tier Cannabis Cultivation', NULL, 'text', 'seo', 'Search engines', 'Home page browser title', NULL, 66),
  ('seo.homeDescription', 'Lead Farmer grows premium cannabis in New York''s Southern Tier with precision, craft, and care from clone to cure.', NULL, 'textarea', 'seo', 'Search engines', 'Home page description', 'Shown in Google results. Around 150 characters works best.', 67),
  ('seo.storyTitle', 'Our Story — Lead Farmer', NULL, 'text', 'seo', 'Search engines', 'Story page browser title', NULL, 68),
  ('seo.storyDescription', 'The story behind Lead Farmer — Southern Tier cannabis cultivation grown with precision and care, plus where to find it across New York.', NULL, 'textarea', 'seo', 'Search engines', 'Story page description', NULL, 69),
  ('seo.strainsTitle', 'Strains — Lead Farmer', NULL, 'text', 'seo', 'Search engines', 'Strains page browser title', NULL, 70),
  ('seo.strainsDescription', 'Browse every Lead Farmer strain currently in rotation — filter by type or format, or search by name.', NULL, 'textarea', 'seo', 'Search engines', 'Strains page description', NULL, 71),
  ('seo.merchTitle', 'Merch — Lead Farmer', NULL, 'text', 'seo', 'Search engines', 'Merch page browser title', NULL, 72),
  ('seo.merchDescription', 'Lead Farmer branded merch — shop hats, tees, and more on our online store.', NULL, 'textarea', 'seo', 'Search engines', 'Merch page description', NULL, 73);

-- Note: re-running this file will fail on the unique key rather than silently
-- overwriting edits the client has made. To intentionally reset page copy,
-- delete the rows first:  DELETE FROM content_blocks;

-- ---------------------------------------------------------------------------
-- Strains (11) — generated from src/app/data/strains.data.ts
-- ---------------------------------------------------------------------------

-- MAC1
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (1, 'mac1', 'MAC1', 'The Capulator''s Cut of one of modern cannabis'' most coveted hybrids — a naturally-occurring triploid, grown and hand-trimmed in-house.', 1, '2026-01-12', 0, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'main', 'assets/product/Mac/mac1-flower.jpg', 'MAC1 — hand-trimmed indoor flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'gallery', 'assets/product/Mac/mac1-flower-2.jpg', 'MAC1 — nug close-up', 'Nug Close-Up', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'gallery', 'assets/product/Mac/mac1-five-pack-opened.jpg', 'MAC1 — five-pack of prerolls, opened', 'Five-Pack Opened', 1);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'packaging', 'assets/product/Mac/mac1-eighth.jpg', 'MAC1 — packaged eighth', 'Eighth', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'packaging', 'assets/product/Mac/mac1-five-pack.jpg', 'MAC1 — packaged five-pack', 'Five-Pack', 1);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (1, 'packaging', 'assets/product/Mac/mac1-preroll.jpg', 'MAC1 — preroll', 'Preroll', 2);

-- Cap Junky
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (2, 'cap-junky', 'Cap Junky', 'Miracle Mintz — a mintier, fruitier expression of the legendary MAC1 with heavy knockout power.', 0, '2025-11-03', 1, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (2, 'main', 'assets/product/Cap-Junky/cap-junky-flower.jpg', 'Cap Junky — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (2, 'packaging', 'assets/product/Cap-Junky/cap-junky-dub-sack.jpg', 'Cap Junky — dub sack', 'Dub Sack', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (2, 'packaging', 'assets/product/Cap-Junky/cap-junky-eighth.jpg', 'Cap Junky — packaged eighth', 'Eighth', 1);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (2, 'packaging', 'assets/product/Cap-Junky/cap-junky-quarter.jpg', 'Cap Junky — packaged quarter', 'Quarter', 2);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (2, 'packaging', 'assets/product/Cap-Junky/cap-junky-preroll.jpg', 'Cap Junky — preroll', 'Preroll', 3);

-- Tricho Jordan #3
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (3, 'tricho-jordan-3', 'Tricho Jordan #3', 'A LeadFarmer pheno hunt pushing trichome production to the next level — creamy butterscotch and port wine.', 0, '2025-09-20', 2, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (3, 'main', 'assets/product/Tricho-Jordan/tricho-jordan-flower.jpg', 'Tricho Jordan #3 — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (3, 'packaging', 'assets/product/Tricho-Jordan/tricho-jordan-dub-sack.jpg', 'Tricho Jordan #3 — dub sack', 'Dub Sack', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (3, 'packaging', 'assets/product/Tricho-Jordan/tricho-jordan-eighth.jpg', 'Tricho Jordan #3 — packaged eighth', 'Eighth', 1);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (3, 'packaging', 'assets/product/Tricho-Jordan/tricho-jordan-half.jpg', 'Tricho Jordan #3 — packaged half ounce', 'Half Ounce', 2);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (3, 'packaging', 'assets/product/Tricho-Jordan/tricho-jordan-preroll.jpg', 'Tricho Jordan #3 — preroll', 'Preroll', 3);

-- White Runtz
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (4, 'white-runtz', 'White Runtz', 'A legendary 2017 collab with the Runtz crew — crazy bag appeal, a gassy nose, and total chill-mode effects.', 1, '2026-02-01', 3, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (4, 'main', 'assets/product/White-Runtz/white-runtz-flower.jpg', 'White Runtz — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (4, 'gallery', 'assets/product/White-Runtz/white-runtz-five-pack-opened.jpg', 'White Runtz — five-pack of prerolls, opened', 'Five-Pack Opened', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (4, 'packaging', 'assets/product/White-Runtz/white-runtz-flower-package.jpg', 'White Runtz — packaged flower', 'Packaged Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (4, 'packaging', 'assets/product/White-Runtz/white-runtz-preroll.jpg', 'White Runtz — preroll', 'Preroll', 1);

-- Honey Banana
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (5, 'honey-banana', 'Honey Banana', 'A 15-year crowd favorite bred by Elemental Seed Co. — dense nugs and banana taffy, in limited quantities.', 1, '2025-12-10', 4, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (5, 'main', 'assets/product/Honey-Banana/honey-banana-flower.jpg', 'Honey Banana — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (5, 'packaging', 'assets/product/Honey-Banana/honey-banana-eighth.jpg', 'Honey Banana — packaged eighth', 'Eighth', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (5, 'packaging', 'assets/product/Honey-Banana/honey-banana-preroll.jpg', 'Honey Banana — preroll', 'Preroll', 1);

-- Galactic Warheads
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (6, 'galactic-warheads', 'Galactic Warheads', 'A Craft Farmer × DankMob collab crossing Amnesia Haze with Colombian Cookies — candy gas, playful high.', 0, '2025-10-08', 5, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (6, 'main', 'assets/product/Galactic-Warheads/galactic-warheads-flower.jpg', 'Galactic Warheads — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (6, 'packaging', 'assets/product/Galactic-Warheads/galactic-warheads-eighth.jpg', 'Galactic Warheads — packaged eighth', 'Eighth', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (6, 'packaging', 'assets/product/Galactic-Warheads/galactic-warheads-preroll.jpg', 'Galactic Warheads — preroll', 'Preroll', 1);

-- Blue Zushi
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (9, 'blue-zushi', 'Blue Zushi', 'Description coming soon — check back for details on this strain.', 0, '2026-07-21', 6, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (9, 'main', 'assets/product/Blue-Zushi/blue-zushi-flower.jpg', 'Blue Zushi — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (9, 'packaging', 'assets/product/Blue-Zushi/blue-zushi-eighth.jpg', 'Blue Zushi — packaged eighth', 'Eighth', 0);

-- Zoap
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (10, 'zoap', 'Zoap', 'Description coming soon — check back for details on this strain.', 0, '2026-07-21', 7, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (10, 'main', 'assets/product/Zoap/zoap-flower.jpg', 'Zoap — flower', 'Flower', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (10, 'packaging', 'assets/product/Zoap/zoap-dub-sack.jpg', 'Zoap — dub sack', 'Dub Sack', 0);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (10, 'packaging', 'assets/product/Zoap/zoap-eighth.jpg', 'Zoap — packaged eighth', 'Eighth', 1);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (10, 'packaging', 'assets/product/Zoap/zoap-quarter.jpg', 'Zoap — packaged quarter', 'Quarter', 2);
INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (10, 'packaging', 'assets/product/Zoap/zoap-half-ounce.jpg', 'Zoap — packaged half ounce', 'Half Ounce', 3);

-- Skunk #1 × Northern Lights #5
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (11, 'skunk-1-x-northern-lights-5', 'Skunk #1 × Northern Lights #5', 'Description coming soon — check back for details on this strain.', 0, '2026-07-21', 8, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (11, 'main', 'assets/product/SkunkXNL/skunk-nl5-flower.jpg', 'Skunk #1 × Northern Lights #5 — flower', 'Flower', 0);

-- Z-Pie Doink
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (7, 'z-pie-doink', 'Z-Pie Doink', 'A first-of-its-kind NY collab — 3.5g of indoor Z Pie, hand-rolled with a 1-of-1000 collectible glass tip.', 1, '2026-03-15', 9, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (7, 'main', 'assets/product/Z-Pie-Doink/z-pie-doink.jpg', 'Z-Pie Doink — special preroll with collectible glass tip', 'Special Preroll', 0);

-- Zlushies × Zoapinator
INSERT INTO strains (id, slug, name, short_description, featured, release_date, sort_order, is_published)
VALUES
  (8, 'zlushies-zoapinator', 'Zlushies × Zoapinator', 'LeadFarmer''s own infused preroll blend — Z and Zoap-crossed flower hand-churned with Tricho Jordan #3 kief.', 0, '2025-08-22', 10, 1);

INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order) VALUES (8, 'main', 'assets/product/Zlushies-Zoapinator/zlushies-zoapinator-preroll.jpg', 'Zlushies × Zoapinator — infused preroll', 'Infused Preroll', 0);

ALTER TABLE strains AUTO_INCREMENT = 12;

-- ---------------------------------------------------------------------------
-- Dispensaries (16) — generated from src/app/data/dispensaries.data.ts
-- ---------------------------------------------------------------------------

INSERT INTO dispensaries (name, location, region, website_url, is_published)
VALUES
  ('Cannabis Realm', 'White Plains & Spring Valley', 'Hudson Valley', NULL, 1),
  ('Treehouse Cannabis', 'Nyack', 'Hudson Valley', NULL, 1),
  ('Valley Greens', 'Peekskill', 'Hudson Valley', NULL, 1),
  ('Windy Hill Wellness', 'Greenwich', 'Capital Region & North Country', NULL, 1),
  ('The Bakery', 'Cohoes', 'Capital Region & North Country', NULL, 1),
  ('Elevate ADK', 'Saranac Lake', 'Capital Region & North Country', NULL, 1),
  ('Greenery Spot', 'Johnson City', 'Southern Tier & Finger Lakes', NULL, 1),
  ('Misfits Dispensary', 'Rochester', 'Southern Tier & Finger Lakes', NULL, 1),
  ('Finger Lakes Cannabis Co.', 'Victor', 'Southern Tier & Finger Lakes', NULL, 1),
  ('Happy Days', 'Farmingdale', 'Long Island', NULL, 1),
  ('Good Daze', 'Little Neck, Queens', 'New York City', NULL, 1),
  ('Terp Bros', 'Astoria, Queens', 'New York City', NULL, 1),
  ('Green Apple', 'Greenpoint, Brooklyn', 'New York City', NULL, 1),
  ('Twenty8Gramz', 'Brooklyn', 'New York City', NULL, 1),
  ('Mighty Lucky', 'Lower Manhattan', 'New York City', NULL, 1),
  ('Torches NYC', 'Midtown Manhattan', 'New York City', NULL, 1);

-- ---------------------------------------------------------------------------
-- Articles (3) — generated from src/app/data/site-content.data.ts
-- ---------------------------------------------------------------------------

INSERT INTO articles (slug, title, excerpt, published_on, image_src, image_alt, external_url, sort_order, is_published)
VALUES
  ('the-art-of-curing', 'The Art of Curing: Why Patience Matters', 'Great cannabis is not rushed. We break down our curing process and why proper timing makes all the difference in quality and flavor.', '2026-05-01', NULL, NULL, NULL, 0, 1),
  ('southern-tier-climate', 'Southern Tier Growing: Climate Advantages', 'Our region offers unique environmental conditions that contribute to exceptional flower. Learn what makes our location ideal for cultivation.', '2026-04-15', NULL, NULL, NULL, 1, 1),
  ('a-day-in-the-grow-room', 'Behind the Scenes: A Day in the Grow Room', 'From environmental controls to daily plant care, get an inside look at the dedication and precision that goes into every harvest.', '2026-04-03', NULL, NULL, NULL, 2, 1);

-- ---------------------------------------------------------------------------
-- Home page gallery (36) — derived from the strain photos
-- ---------------------------------------------------------------------------

INSERT INTO gallery_images (image_src, image_alt, caption, sort_order, is_published)
VALUES
  ('assets/product/Mac/mac1-flower.jpg', 'MAC1 — hand-trimmed indoor flower', 'MAC1', 0, 1),
  ('assets/product/Mac/mac1-flower-2.jpg', 'MAC1 — nug close-up', NULL, 1, 1),
  ('assets/product/Mac/mac1-five-pack-opened.jpg', 'MAC1 — five-pack of prerolls, opened', NULL, 2, 1),
  ('assets/product/Mac/mac1-eighth.jpg', 'MAC1 — packaged eighth', NULL, 3, 1),
  ('assets/product/Mac/mac1-five-pack.jpg', 'MAC1 — packaged five-pack', NULL, 4, 1),
  ('assets/product/Mac/mac1-preroll.jpg', 'MAC1 — preroll', NULL, 5, 1),
  ('assets/product/Cap-Junky/cap-junky-flower.jpg', 'Cap Junky — flower', 'Cap Junky', 6, 1),
  ('assets/product/Cap-Junky/cap-junky-dub-sack.jpg', 'Cap Junky — dub sack', NULL, 7, 1),
  ('assets/product/Cap-Junky/cap-junky-eighth.jpg', 'Cap Junky — packaged eighth', NULL, 8, 1),
  ('assets/product/Cap-Junky/cap-junky-quarter.jpg', 'Cap Junky — packaged quarter', NULL, 9, 1),
  ('assets/product/Cap-Junky/cap-junky-preroll.jpg', 'Cap Junky — preroll', NULL, 10, 1),
  ('assets/product/Tricho-Jordan/tricho-jordan-flower.jpg', 'Tricho Jordan #3 — flower', 'Tricho Jordan #3', 11, 1),
  ('assets/product/Tricho-Jordan/tricho-jordan-dub-sack.jpg', 'Tricho Jordan #3 — dub sack', NULL, 12, 1),
  ('assets/product/Tricho-Jordan/tricho-jordan-eighth.jpg', 'Tricho Jordan #3 — packaged eighth', NULL, 13, 1),
  ('assets/product/Tricho-Jordan/tricho-jordan-half.jpg', 'Tricho Jordan #3 — packaged half ounce', NULL, 14, 1),
  ('assets/product/Tricho-Jordan/tricho-jordan-preroll.jpg', 'Tricho Jordan #3 — preroll', NULL, 15, 1),
  ('assets/product/White-Runtz/white-runtz-flower.jpg', 'White Runtz — flower', 'White Runtz', 16, 1),
  ('assets/product/White-Runtz/white-runtz-five-pack-opened.jpg', 'White Runtz — five-pack of prerolls, opened', NULL, 17, 1),
  ('assets/product/White-Runtz/white-runtz-flower-package.jpg', 'White Runtz — packaged flower', NULL, 18, 1),
  ('assets/product/White-Runtz/white-runtz-preroll.jpg', 'White Runtz — preroll', NULL, 19, 1),
  ('assets/product/Honey-Banana/honey-banana-flower.jpg', 'Honey Banana — flower', 'Honey Banana', 20, 1),
  ('assets/product/Honey-Banana/honey-banana-eighth.jpg', 'Honey Banana — packaged eighth', NULL, 21, 1),
  ('assets/product/Honey-Banana/honey-banana-preroll.jpg', 'Honey Banana — preroll', NULL, 22, 1),
  ('assets/product/Galactic-Warheads/galactic-warheads-flower.jpg', 'Galactic Warheads — flower', 'Galactic Warheads', 23, 1),
  ('assets/product/Galactic-Warheads/galactic-warheads-eighth.jpg', 'Galactic Warheads — packaged eighth', NULL, 24, 1),
  ('assets/product/Galactic-Warheads/galactic-warheads-preroll.jpg', 'Galactic Warheads — preroll', NULL, 25, 1),
  ('assets/product/Blue-Zushi/blue-zushi-flower.jpg', 'Blue Zushi — flower', 'Blue Zushi', 26, 1),
  ('assets/product/Blue-Zushi/blue-zushi-eighth.jpg', 'Blue Zushi — packaged eighth', NULL, 27, 1),
  ('assets/product/Zoap/zoap-flower.jpg', 'Zoap — flower', 'Zoap', 28, 1),
  ('assets/product/Zoap/zoap-dub-sack.jpg', 'Zoap — dub sack', NULL, 29, 1),
  ('assets/product/Zoap/zoap-eighth.jpg', 'Zoap — packaged eighth', NULL, 30, 1),
  ('assets/product/Zoap/zoap-quarter.jpg', 'Zoap — packaged quarter', NULL, 31, 1),
  ('assets/product/Zoap/zoap-half-ounce.jpg', 'Zoap — packaged half ounce', NULL, 32, 1),
  ('assets/product/SkunkXNL/skunk-nl5-flower.jpg', 'Skunk #1 × Northern Lights #5 — flower', 'Skunk #1 × Northern Lights #5', 33, 1),
  ('assets/product/Z-Pie-Doink/z-pie-doink.jpg', 'Z-Pie Doink — special preroll with collectible glass tip', 'Z-Pie Doink', 34, 1),
  ('assets/product/Zlushies-Zoapinator/zlushies-zoapinator-preroll.jpg', 'Zlushies × Zoapinator — infused preroll', 'Zlushies × Zoapinator', 35, 1);

-- ---------------------------------------------------------------------------
-- Story page — image/text rows (2)
-- ---------------------------------------------------------------------------

INSERT INTO story_sections (eyebrow, heading, body, image_src, image_alt, sort_order, is_published)
VALUES
  ('Our Roots', 'Southern Tier Grown', 'Lead Farmer started with a simple belief: New York deserves cannabis grown with the same care as the region''s best agriculture. Our rooms in the Southern Tier are built for precision — controlled environments, deliberate genetics, and a team that treats every room like the only one that matters.', 'assets/product/Mac/mac1-flower.jpg', NULL, 0, 1),
  ('Our Process', 'Hand-Trimmed, No Shortcuts', 'Nothing about our process is automated for the sake of speed. Every plant is hand-trimmed in-house, every cure is given the time it needs, and every batch is checked against the same standard before it ever leaves the building. If it doesn''t meet that bar, it doesn''t wear our name.', 'assets/product/Cap-Junky/cap-junky-flower.jpg', NULL, 1, 1);

-- ---------------------------------------------------------------------------
-- Story page — statistics band (3)
-- ---------------------------------------------------------------------------

INSERT INTO story_stats (value, label, auto_source, is_text_style, sort_order, is_published)
VALUES
  ('', 'Dispensaries Across New York', 'dispensary_count', 0, 0, 1),
  ('100%', 'Hand-Trimmed, In-House', NULL, 0, 1, 1),
  ('Southern Tier', 'New York — Where It''s Grown', NULL, 1, 2, 1);
