-- ============================================================================
-- Lead Farmer — database schema
--
-- Target: MySQL 5.7+ / MariaDB 10.2+ (the usual cPanel shared-hosting range).
-- Indexed string columns are VARCHAR(191) so they fit InnoDB's 767-byte key
-- limit under utf8mb4 on older row formats.
--
-- Apply with:  mysql -u USER -p DBNAME < schema.sql
-- or paste into phpMyAdmin → SQL.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ----------------------------------------------------------------------------
-- Authentication
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username       VARCHAR(191) NOT NULL,
  email          VARCHAR(191) NULL,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feeds the login rate limiter. Pruned automatically after 30 days.
CREATE TABLE IF NOT EXISTS login_attempts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(191) NOT NULL,
  ip_address    VARCHAR(45) NOT NULL,
  success       TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_attempts_lookup (attempted_at, success),
  KEY idx_login_attempts_ip (ip_address),
  KEY idx_login_attempts_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Page content — one row per editable field on the public site.
--
-- content_key is a descriptive dotted path (homepage.heroTagline), NOT a
-- positional name. field_type drives which input the admin UI renders.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content_blocks (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  content_key   VARCHAR(191) NOT NULL,
  content_value TEXT NULL,
  -- For field_type='image': the alt text describing that image.
  alt_text      VARCHAR(500) NULL,
  -- 'text' | 'textarea' | 'url' | 'image' — how the admin UI renders this field.
  field_type    VARCHAR(20) NOT NULL DEFAULT 'text',
  -- Admin UI grouping, e.g. 'homepage', 'story', 'merch', 'footer'.
  section       VARCHAR(64) NOT NULL DEFAULT 'general',
  -- Sub-heading inside a section, e.g. 'Hero', 'Contact'.
  group_label   VARCHAR(120) NOT NULL DEFAULT '',
  -- Plain-language label shown to the client, e.g. 'Main headline'.
  field_label   VARCHAR(191) NOT NULL,
  -- Optional hint under the input.
  help_text     VARCHAR(500) NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_content_blocks_key (content_key),
  KEY idx_content_blocks_section (section, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Media library — every image uploaded through the admin panel.
-- Images that shipped with the original build live under assets/ and are not
-- rows here; they are referenced by path and can be replaced by uploads.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  filename      VARCHAR(191) NOT NULL,
  url_path      VARCHAR(500) NOT NULL,
  original_name VARCHAR(191) NULL,
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL DEFAULT 0,
  width         INT UNSIGNED NOT NULL DEFAULT 0,
  height        INT UNSIGNED NOT NULL DEFAULT 0,
  alt_text      VARCHAR(500) NULL,
  uploaded_by   INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_filename (filename),
  KEY idx_media_created (created_at),
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploaded_by)
    REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Strains — the product catalog.
--
-- Only what the site renders: the name, the short description and the photos.
-- Growing details, tasting notes, formats and badges were removed along with
-- the page sections that displayed them.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS strains (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug              VARCHAR(191) NOT NULL,
  name              VARCHAR(191) NOT NULL,
  -- The blurb on the strain card and at the top of the strain page.
  short_description TEXT NULL,
  featured          TINYINT(1) NOT NULL DEFAULT 0,
  release_date      DATE NULL,
  -- Controls catalog order within the featured/unfeatured grouping.
  sort_order        INT NOT NULL DEFAULT 0,
  -- 0 hides the strain from the public site without deleting it.
  is_published      TINYINT(1) NOT NULL DEFAULT 1,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_strains_slug (slug),
  KEY idx_strains_order (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS strain_images (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  strain_id  INT UNSIGNED NOT NULL,
  -- 'main' (exactly one per strain) | 'gallery' | 'packaging'
  image_kind VARCHAR(20) NOT NULL DEFAULT 'gallery',
  src        VARCHAR(500) NOT NULL,
  alt        VARCHAR(500) NOT NULL DEFAULT '',
  label      VARCHAR(191) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_strain_images_strain (strain_id, image_kind, sort_order),
  CONSTRAINT fk_strain_images_strain FOREIGN KEY (strain_id)
    REFERENCES strains (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Dispensary directory (Story page). Sorted alphabetically by region, then
-- by name — there is no manual ordering.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dispensaries (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(191) NOT NULL,
  location     VARCHAR(191) NOT NULL,
  region       VARCHAR(120) NOT NULL,
  website_url  VARCHAR(500) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dispensaries_order (region, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Articles (home page "Field Notes")
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS articles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(191) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  excerpt       TEXT NULL,
  published_on  DATE NULL,
  image_src     VARCHAR(500) NULL,
  image_alt     VARCHAR(500) NULL,
  external_url  VARCHAR(500) NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_published  TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_order (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Contact form submissions.
--
-- Every message is stored as well as emailed. PHP's mail() on shared hosting
-- fails quietly often enough that email alone would lose enquiries, so the
-- database is the record and the email is the notification.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contact_messages (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(191) NOT NULL,
  email        VARCHAR(191) NOT NULL,
  phone        VARCHAR(60) NULL,
  subject      VARCHAR(191) NULL,
  message      TEXT NOT NULL,
  -- Set when the enquiry came from a strain's wholesale button.
  strain_name  VARCHAR(191) NULL,
  ip_address   VARCHAR(45) NULL,
  -- Whether the notification email actually went out.
  email_sent   TINYINT(1) NOT NULL DEFAULT 0,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_messages_created (created_at),
  KEY idx_contact_messages_unread (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Home page photo gallery
--
-- Curated by hand in the dashboard. It was originally assembled automatically
-- from every strain photo; the seed reproduces exactly that set, so the page is
-- unchanged, but the client can now reorder, remove and add photos freely.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS gallery_images (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_src    VARCHAR(500) NOT NULL,
  image_alt    VARCHAR(500) NOT NULL DEFAULT '',
  -- Optional white label drawn over the photo (originally the strain name).
  caption      VARCHAR(191) NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gallery_images_order (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Story page repeatables
-- ----------------------------------------------------------------------------

-- The alternating image/text rows ("Our Roots", "Our Process", ...).
CREATE TABLE IF NOT EXISTS story_sections (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  eyebrow      VARCHAR(191) NOT NULL DEFAULT '',
  heading      VARCHAR(255) NOT NULL,
  body         TEXT NULL,
  image_src    VARCHAR(500) NULL,
  image_alt    VARCHAR(500) NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_story_sections_order (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The three-across stat band.
CREATE TABLE IF NOT EXISTS story_stats (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Big line. Leave blank and set auto_source to fill it automatically.
  value        VARCHAR(100) NOT NULL DEFAULT '',
  label        VARCHAR(191) NOT NULL,
  -- 'dispensary_count' makes the value track the live dispensary total.
  auto_source  VARCHAR(40) NULL,
  -- 1 renders the value in the smaller word style (e.g. "Southern Tier").
  is_text_style TINYINT(1) NOT NULL DEFAULT 0,
  sort_order   INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_story_stats_order (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
