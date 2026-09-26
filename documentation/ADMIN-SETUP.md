# Lead Farmer — content manager: setup & deployment

The site is an Angular single-page app with a small PHP + MySQL API behind it.
Both run on the same Namecheap/cPanel hosting account. There is no Node server,
no external CMS and nothing to pay for beyond the hosting you already have.

```
Visitor  →  public_html/index.html        (Angular app)
            public_html/api/…             (PHP API, reads/writes MySQL)
            public_html/uploads/…         (images the client uploads)
Client   →  yourdomain.com/admin          (dashboard, same Angular app)
```

---

## 1. What lives where

| Path | What it is | Replaced on deploy? |
|---|---|---|
| `public_html/index.html`, `*.js`, `*.css`, `assets/` | The built Angular app | **Yes** — every deploy |
| `public_html/api/` | The PHP API | Only when the API changes |
| `public_html/uploads/` | Images uploaded through the dashboard | **Never** |
| `public_html/.htaccess` | Routing, HTTPS, caching | Only when it changes |
| `~/leadfarmer-config/config.php` | Database credentials | Never (outside the web root) |

> **The rule that matters:** a deploy replaces the Angular build files only.
> Never delete `api/` or `uploads/` — that is where the client's edits and photos
> live. See §7.

---

## 2. Requirements

* PHP **8.1 or newer** with `pdo_mysql`, `fileinfo` and `gd` (all standard on cPanel).
  Set the version in cPanel → *MultiPHP Manager*.
* MySQL 5.7+ / MariaDB 10.2+ (cPanel → *MySQL Databases*).
* Apache with `mod_rewrite` and `mod_headers` (on by default).

---

## 3. First-time setup

### 3.1 Create the database

cPanel → **MySQL Databases**:

1. Create a database, e.g. `leadfarmer`. cPanel prefixes it — the real name will
   be something like `cpuser_leadfarmer`.
2. Create a user, e.g. `lfadmin`, with a long generated password.
3. Add the user to the database with **All Privileges**.
4. Write down the *prefixed* database name, the *prefixed* user name, and the password.

### 3.2 Load the schema and content

cPanel → **phpMyAdmin** → select the database → **Import**, and run these in order:

1. `api/database/schema.sql` — creates the tables.
2. `api/database/seed.sql` — fills in the site's current content
   (74 page fields, 11 strains, 36 gallery photos, 16 dispensaries, 3 articles,
   and the Story page sections and statistics).

After seeding, the site looks exactly as it does today.

> `seed.sql` is generated, not hand-written. Rebuild it from the data files in
> `src/app/data/` with `npm run generate-seed`.

### 3.3 Put the credentials outside the web root

Using cPanel → **File Manager** (enable *Show hidden files*):

1. In your home directory (`/home/<cpanel-user>/`, the folder **containing**
   `public_html`), create a folder named `leadfarmer-config`.
2. Copy `api/config.example.php` into it as `config.php`.
3. Edit it and fill in:

```php
'db' => [
    'host'     => 'localhost',
    'name'     => 'cpuser_leadfarmer',   // the prefixed name
    'user'     => 'cpuser_lfadmin',      // the prefixed user
    'password' => '…',
],
'public_base_url' => 'https://yourdomain.com',   // no trailing slash
'session' => [ 'secure' => true, … ],            // true once HTTPS is on
'setup_token' => null,
'debug' => false,
```

4. Set its permissions to **600** (File Manager → right-click → Change Permissions).

The API finds this file automatically. If your layout is unusual, uncomment the
`SetEnv LEADFARMER_CONFIG …` line at the top of `api/.htaccess` and point it at
the file.

**Never** put `config.php` inside `public_html`, and never commit it.

### 3.4 Upload the files

Upload to `public_html/`:

* everything inside `dist/leadfarmer/browser/` → straight into `public_html/`
* the `api/` folder → `public_html/api/`
* `deploy/public_html.htaccess` → `public_html/.htaccess` *(note the rename)*

Then create `public_html/uploads/` and upload `uploads/.htaccess` into it.

### 3.5 Permissions

| Path | Permission |
|---|---|
| `public_html/uploads/` | `755` (writable by the web user) |
| `~/leadfarmer-config/config.php` | `600` |
| Other folders | `755` |
| Other files | `644` |

### 3.6 Turn on HTTPS

cPanel → **SSL/TLS Status** → *Run AutoSSL*. Once the padlock works:

* confirm the HTTPS redirect block at the top of `public_html/.htaccess` is
  **uncommented** (it ships enabled),
* confirm `'secure' => true` under `session` in `config.php`,
* optionally uncomment the `Strict-Transport-Security` header.

Doing this before the certificate exists causes a redirect loop, so leave it
until AutoSSL has finished.

### 3.7 Create the administrator account

**Preferred — cPanel → Terminal (or SSH):**

```bash
cd ~/public_html/api
php tools/create-admin.php
```

It asks for a username and password (minimum 12 characters) and stores only a
`password_hash()` digest.

**If your plan has no shell:**

1. Set `'setup_token' => '<a long random string>'` in `config.php`.
2. Visit `https://yourdomain.com/api/tools/setup.php?token=<that string>`.
3. Create the account.
4. Set `'setup_token' => null` again.

That page refuses to run unless a token is configured, refuses a wrong token,
and refuses entirely once any admin exists — so it cannot be used to add a
second account later.

There is no public sign-up and no default password anywhere in this codebase.

### 3.8 Check it

* `https://yourdomain.com/api/health` → `{"ok":true,"data":{"status":"up","database":"connected"}}`
* `https://yourdomain.com/` → the site, with content coming from the database
* `https://yourdomain.com/admin` → the sign-in page

---

## 4. Day-to-day: what the client can edit

The dashboard is deliberately small — only the things that actually change:

| Dashboard section | Controls |
|---|---|
| **Strains** | Add/edit/delete/reorder products — name, description and photos. Ticking "Show on the home page" puts one in the home page strip |
| **Gallery** | The photo strip on the home page — add, reorder, caption, remove |
| **Articles** | The "Field Notes" cards |
| **Dispensaries** | Shops on the Story page. Regions and shops sort A–Z automatically, and the statistic counting them updates itself |
| **Story page → Sections** | The alternating picture-and-text rows |
| **Story page → Statistics** | The three-across number band |
| **Messages** | Enquiries from the contact form. Also emailed as they arrive |
| **All images** | Every uploaded photo, with its description (alt text) |
| **Settings** | Contact email, location line, and the merch store link |

A strain is deliberately just a name, a short description and photos: that is
everything the site shows. Growing details, tasting notes, formats and badges
were removed along with the page sections that used to display them, so the
panel never collects information nobody sees. The "check out other products"
strip at the bottom of a strain page is picked at random and needs no curating.

Everything else — page headings, menu labels, hero copy, the age gate, the OCM
warning, SEO titles — is part of the design. It lives in the `content_blocks`
table and still drives the site, but it is not exposed as an editing screen, so
the client is not faced with 74 fields they will never touch.

To let the client edit one of those later, change that row's `section` to
`settings` in the database and it appears on the Settings screen:

```sql
UPDATE content_blocks
   SET section = 'settings', group_label = 'Home page', field_label = 'Main headline'
 WHERE content_key = 'homepage.storyHeading';
```

Layout, fonts, colours and spacing stay in Angular and are never editable — the
client cannot break the design.

Edits are live immediately: the next page load fetches fresh content. Nothing
needs rebuilding or re-uploading.

---

## 4a. Contact form email

The contact form on the home page emails each enquiry and stores a copy under
**Messages** in the dashboard. The copy matters: PHP's `mail()` on shared
hosting fails quietly often enough that email alone would lose enquiries, so a
message whose email did not go out is flagged in the dashboard rather than
vanishing.

**Where enquiries are delivered** is the contact email under *Settings* in the
dashboard — the client can change it themselves without touching config.

> **Set this before launch.** It seeds as `info@leadfarmer.com`, which came from
> the original site copy and may not be a real mailbox. If it is wrong, enquiries
> still appear under Messages but nobody gets notified.

**How they are sent.** Enquiries are POSTed to the shared submission service
(the same Heroku app the other client sites use), which delivers them over
authenticated SMTP — considerably more reliable than PHP's `mail()` on shared
hosting. The call is made server to server, so the browser's CORS rules never
come into it and the Lead Farmer domain does **not** need adding to that
service's allow-list.

```php
'mail' => [
    'relay_url'     => 'https://twg-template-submission-92b1532f00c1.herokuapp.com/send-email-universal',
    'relay_timeout' => 20,
    'from'          => null,   // only used by the mail() fallback
    'from_name'     => 'Lead Farmer Website',
],
```

If that service is unreachable the API falls back to PHP `mail()` on its own.
Set `relay_url` to `null` to skip the service entirely and always use `mail()`.

The recipient is never taken from the request — a visitor cannot redirect an
enquiry by posting their own `businessEmail`.

> **What the delivered flag means.** The service answers 200 once the message
> is *accepted for delivery*, which is not the same as it arriving. A message
> shown as delivered in the dashboard could still bounce or be filtered. The
> flag is there to catch outages, not to prove inbox arrival.

The wholesale button on every strain page links to this form with the strain
pre-filled, rather than opening a `mailto:` — which does nothing for anyone
browsing without a desktop mail client set up.

Spam protection is a hidden honeypot field plus a five-per-hour cap per IP
address, both enforced server-side. There is no CAPTCHA.

If enquiries arrive in the dashboard but not by email, the cause is almost
always mail configuration rather than the site: check the From address exists,
and check cPanel → *Track Delivery*.

---

## 5. Local development

Two terminals from the repository root:

```bash
# 1. PHP API + uploads on :8000
php -S localhost:8000 -t .

# 2. Angular dev server on :4200 (proxies /api and /uploads to :8000)
npm start
```

`proxy.conf.json` makes the browser see a single origin, so session cookies
behave exactly as they do in production.

For the local database, create one and load `schema.sql` + `seed.sql`, then put a
`config.php` at `api/config.php` (git-ignored, blocked from HTTP by
`api/.htaccess`) with `'secure' => false` under `session` — a Secure cookie is
dropped over plain `http://`.

Create a local admin with `php api/tools/create-admin.php`.

---

## 6. Deploying a new Angular build

```bash
npm run build          # writes dist/leadfarmer/browser/
```

Upload **only** the contents of `dist/leadfarmer/browser/` into `public_html/`,
overwriting what is there.

**Do not** delete `public_html/api/` or `public_html/uploads/` — the client's
content and photos live there. If you use FTP sync or a deploy script, exclude
both, plus `.htaccess`:

```
# example rsync
rsync -av --delete \
  --exclude 'api/' --exclude 'uploads/' --exclude '.htaccess' \
  dist/leadfarmer/browser/ user@host:~/public_html/
```

Old hashed JS/CSS files can be deleted; `index.html` always points at the current
ones and is served with `no-store`, so returning visitors pick up the new build
immediately.

---

## 7. Backups

Two things to back up, on different schedules:

1. **Database** — cPanel → *Backup* → *Download a MySQL Database Backup*, or
   phpMyAdmin → *Export*. This holds every word of content, every strain and
   every dispensary. Back up before any deploy that touches the API.
2. **`public_html/uploads/`** — the actual image files. The database references
   them by name; without the files, images break.

The Angular build does not need backing up — it is rebuilt from this repository.

---

## 8. Security notes

Implemented server-side, all enforced independently of the browser:

* Passwords stored with `password_hash()` (bcrypt), verified with
  `password_verify()`, transparently re-hashed if the cost factor rises.
* Session cookie is `HttpOnly`, `SameSite=Lax` and `Secure` in production;
  the session id is regenerated on sign-in (session-fixation defence), plus an
  8-hour idle timeout enforced on the server.
* Every write endpoint requires **both** a valid session and a matching CSRF
  token (`X-CSRF-Token`, compared to a per-session secret with `hash_equals`).
* Login attempts are rate-limited per IP **and** per username (8 failures in
  15 minutes), with constant-ish timing so a missing user and a wrong password
  are indistinguishable.
* Every SQL statement is a prepared statement with bound parameters;
  `PDO::ATTR_EMULATE_PREPARES` is off. Column names come from server-side
  whitelists, never from request data.
* Uploads: real MIME type detected with `finfo` **and** `getimagesize` (the
  client's filename and Content-Type are ignored), 8 MB cap, JPEG/PNG/WebP only,
  randomly generated filename with an extension derived from the detected type,
  and `uploads/.htaccess` disables script execution in that directory.
* All output is rendered through Angular interpolation, which escapes by
  default. No `innerHTML`, no `bypassSecurityTrust*` anywhere.
* Angular's route guards are convenience only — they are explicitly **not** the
  security boundary. Every `/api/admin/*` request is checked on the server.

### Verified before hand-off

47 API tests (auth, CSRF, unauthorised writes, CRUD, uploads, SQL injection) and
30 browser tests (login, editing, validation, uploads, reordering, deletion,
logout) pass against PHP 8.2 + MariaDB 10.11. See the hand-off notes for details.

---

## 9. Preview and staging sites

### GitHub Pages

GitHub Pages serves static files only — no PHP, no MySQL. So:

* **The public site works.** With no backend to answer `/api/...`, Angular falls
  back to the content bundled in the build (`src/app/data/`), and every page
  renders completely: all 11 strains, the dispensary directory, the Story page
  rows and statistics. Good for showing a client the design.
* **The dashboard does not work.** The sign-in screen loads, but there is
  nothing to authenticate against, and it says so plainly rather than failing
  with a vague error.
* Content edited on the live site does **not** appear on the gh-pages copy —
  gh-pages shows whatever was bundled at build time.

### Deploying the preview

**Pages for this repo serves the `gh-pages` branch — not `main` → `/docs`.**
This matters more than it sounds: pushing `main` triggers no Pages build at
all, so a push can look completely successful while the live site carries on
serving the previous build. Verify with *Settings → Pages* if in doubt.

Two steps, and the second is the one that actually deploys:

```bash
npm run build:ghpages     # builds into docs/ (committed on main for review)
npm run deploy:ghpages    # copies docs/ onto gh-pages — this is the deploy
```

`deploy:ghpages` works through a temporary git worktree, so it never touches
your working tree or switches your branch. It refuses to publish if the base
href is wrong, and does nothing if `gh-pages` already matches `docs/`.

To confirm a deploy really landed, compare the bundle the live site references
against your build — if they differ, Pages has not finished (give it a minute)
or never built:

```bash
curl -s https://theofficialwebsiteguys.github.io/leadfarmer/ | grep -o 'main-[A-Z0-9]*.js'
grep -o 'main-[A-Z0-9]*.js' docs/index.html | head -1
```

`docs/` is **build output only** — it is wiped and rewritten on every build.
Written documentation lives in `documentation/` for that reason.

The build script handles three things that are easy to get wrong:

* the base href is set in `angular.json`, not on the command line — passing
  `/leadfarmer/` through Git Bash rewrites it to a Windows path and produces a
  page that loads nothing,
* `404.html` is written as a copy of `index.html`, which is what makes deep
  links like `/strains/mac1` survive a refresh on Pages,
* the build fails if the base href is not `/leadfarmer/`, because a broken one
  is invisible until the site is dead.

Pages can take a minute or two to serve a new build. Confirm the deploy landed
by checking the bundle hash rather than trusting the page to look updated:

```bash
curl -s https://theofficialwebsiteguys.github.io/leadfarmer/ | grep -o 'main-[A-Z0-9]*\.js'
grep -o 'main-[A-Z0-9]*\.js' docs/index.html
```

### A staging site with a working dashboard

If you want a test environment where the admin panel actually functions, put it
on the same cPanel account as a subdomain — cPanel → *Domains* → *Create A New
Domain*, e.g. `staging.yourdomain.com` with its own document root.

Repeat §3 for it with **its own database** (`cpuser_leadfarmer_staging`) and its
own `config.php` (a second folder outside `public_html`). That gives a full,
working copy your client can safely experiment in without touching live content,
at no extra hosting cost.

This is the only way to preview the dashboard realistically — pointing a
gh-pages build at the production API would mean cross-origin cookies, a CORS
allow-list, and a test site writing into the live database. Not worth it.

---

## 10. SEO limitation (unchanged from before)

This is a client-rendered app: page titles and meta descriptions are set by
JavaScript after load, and are editable under **Search engines** in the
dashboard. Google executes JavaScript and indexes such pages, but some crawlers
and social-preview scrapers do not.

This is exactly how the site behaved before the CMS — nothing regressed. If
link previews or non-Google crawlers become important, the fix is Angular SSR
(`@angular/ssr`), which needs a Node runtime and therefore different hosting, or
a small PHP shim that injects per-route meta tags into `index.html`.
